import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /// User Profile Management
  type ProfileId = Nat;
  var nextProfileId : ProfileId = 0;
  let profiles = Map.empty<ProfileId, UserProfile>();
  let users = Map.empty<Principal, ProfileId>();

  public type UserProfile = {
    id : ProfileId;
    principal : Principal;
    name : Text;
    email : Text;
    avatarUrl : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
  };

  public type CreateUserProfileDto = {
    name : Text;
    email : Text;
  };

  public type UpdateUserProfileDto = {
    name : Text;
    email : Text;
  };

  public shared ({ caller }) func createProfile(createProfileDto : CreateUserProfileDto) : async UserProfile {
    if (isRegisteredInternal(caller)) {
      Runtime.trap("User already registered");
    };
    let id = nextProfileId;
    nextProfileId += 1;
    let profile = {
      id;
      principal = caller;
      name = createProfileDto.name;
      email = createProfileDto.email;
      avatarUrl = "";
      role = #user;
      createdAt = Time.now();
    };
    profiles.add(id, profile);
    users.add(caller, id);
    profile;
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    profiles.values().toArray();
  };

  public query ({ caller }) func getUserProfile(principal : Principal) : async UserProfile {
    if (principal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getOrTrap(principal);
  };

  public shared ({ caller }) func updateMyProfile(updateProfileDto : UpdateUserProfileDto) : async () {
    if (not users.containsKey(caller)) {
      Runtime.trap("User not registered");
    };
    updateProfile(caller, ?caller, ?updateProfileDto, null);
  };

  public shared ({ caller }) func setUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change user roles");
    };
    if (user == caller) {
      Runtime.trap("Cannot change your own role");
    };
    updateProfile(user, ?caller, null, ?role);
  };

  /// Learning Dto
  public type CreateCourseDto = {
    title : Text;
  };

  /// Course Management
  type CourseId = Nat;
  var nextCourseId : CourseId = 0;
  let courses = Map.empty<CourseId, Course>();

  public type Course = {
    id : CourseId;
    title : Text;
    tags : [Text];
    views : Nat;
    lessonCount : Nat;
    duration : Nat;
    isPublished : Bool;
    instructorId : Principal;
    createdAt : Time.Time;
  };

  public type UpdateCourseDto = {
    title : Text;
    tags : [Text];
    lessonCount : Nat;
    duration : Nat;
    isPublished : Bool;
  };

  public shared ({ caller }) func createCourse(dto : CreateCourseDto) : async Course {
    if (not isRegisteredInternal(caller)) {
      Runtime.trap("Must be registered");
    };
    let callerProfile = getOrTrap(caller);
    if (callerProfile.role == #guest) {
      Runtime.trap("Guests cannot create courses");
    };
    let id = nextCourseId;
    nextCourseId += 1;
    let course : Course = {
      id;
      title = dto.title;
      tags = [];
      views = 0;
      lessonCount = 0;
      duration = 0;
      isPublished = false;
      instructorId = caller;
      createdAt = Time.now();
    };
    courses.add(id, course);
    course;
  };

  public query ({ caller }) func getCourses() : async [Course] {
    courses.values().toArray();
  };

  public query ({ caller }) func getMyCourses() : async [Course] {
    courses.values().filter(func(c) { c.instructorId == caller }).toArray();
  };

  public shared ({ caller }) func updateCourse(id : CourseId, dto : UpdateCourseDto) : async Course {
    let course = switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?c) { c };
    };
    let callerProfile = getOrTrap(caller);
    if (course.instructorId != caller and callerProfile.role != #admin) {
      Runtime.trap("Unauthorized");
    };
    let updated : Course = {
      course with
      title = dto.title;
      tags = dto.tags;
      lessonCount = dto.lessonCount;
      duration = dto.duration;
      isPublished = dto.isPublished;
    };
    courses.add(id, updated);
    updated;
  };

  public shared ({ caller }) func incrementCourseViews(id : CourseId) : async () {
    let course = switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?c) { c };
    };
    courses.add(id, { course with views = course.views + 1 });
  };

  /// Enrollments
  public type Enrollment = {
    principal : Principal;
    courseId : CourseId;
    enrolledAt : Time.Time;
    isCompleted : Bool;
    completedAt : ?Time.Time;
  };

  let enrollments = Map.empty<Principal, Map.Map<Nat, Enrollment>>();

  public query ({ caller }) func getEnrollments(principal : Principal) : async [Enrollment] {
    if (principal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own enrollments");
    };
    switch (enrollments.get(principal)) {
      case (null) { [] };
      case (?map) { map.values().toArray() };
    };
  };

  public shared ({ caller }) func enrollCourse({ courseId : CourseId }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };
    ignore getOrTrap(caller);
    let course = switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) { course };
    };
    if (not course.isPublished) {
      Runtime.trap("Course not published");
    };
    if (course.instructorId == caller) {
      Runtime.trap("Instructors cannot enroll in their own courses");
    };
    let enrollment : Enrollment = {
      principal = caller;
      courseId;
      enrolledAt = Time.now();
      isCompleted = false;
      completedAt = null;
    };
    let existing = switch (enrollments.get(caller)) {
      case (null) { Map.empty<Nat, Enrollment>() };
      case (?existing) { existing };
    };

    let hasAlreadyEnrolled = switch (enrollments.get(caller)) {
      case (null) { false };
      case (?existing) {
        existing.entries().any(func((_, existingEnrollment)) { existingEnrollment.courseId == courseId });
      };
    };
    if (hasAlreadyEnrolled) { Runtime.trap("Already enrolled") } else {
      existing.add(existing.size(), enrollment);
      enrollments.add(caller, existing);
    };
  };

  func updateProfile(
    principal : Principal,
    caller : ?Principal,
    profileUpdate : ?UpdateUserProfileDto,
    newRoleUpdate : ?AccessControl.UserRole,
  ) {
    let id = getOrTrap(principal).id;
    let profile = switch (profiles.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    let newProfile = {
      profile with
      name = switch (profileUpdate) {
        case (null) { profile.name };
        case (?(newProfile)) { newProfile.name };
      };
      email = switch (profileUpdate) {
        case (null) { profile.email };
        case (?(newProfile)) { newProfile.email };
      };
      avatarUrl = profile.avatarUrl;
      role = switch (newRoleUpdate) {
        case (null) { profile.role };
        case (?role) { role };
      };
      createdAt = profile.createdAt;
    };
    profiles.add(id, newProfile);
  };

  func getOrTrap(principal : Principal) : UserProfile {
    let id = switch (users.get(principal)) {
      case (null) { Runtime.trap("User not found") };
      case (?id) { id };
    };
    switch (profiles.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserCount() : async Nat {
    users.size();
  };

  func isRegisteredInternal(principal : Principal) : Bool {
    users.containsKey(principal);
  };

  func firstAdmin() : ?Principal {
    switch (
      users.entries().find(
        func((principal, id)) {
          switch (profiles.get(id)) {
            case (null) { false };
            case (?profile) { profile.role == #admin };
          };
        }
      )
    ) {
      case (null) { null };
      case (?(principal, _)) { ?principal };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    isRegisteredInternal(caller) and AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func doesAdminExist() : async Bool {
    switch (firstAdmin()) {
      case (null) { false };
      case (_) { true };
    };
  };

  func updateRoleProfile(principal : Principal, role : AccessControl.UserRole) {
    updateProfile(principal, null, null, ?role);
  };

  public shared ({ caller }) func seedFirstAdmin() : async () {
    if (firstAdmin() != null) {
      Runtime.trap("Admin already exists, cannot override");
    };
    let isRegistered = isRegisteredInternal(caller);
    if (not isRegistered) {
      ignore await createProfile({ name = "Admin"; email = "" });
    };
    updateRoleProfile(caller, #admin);
  };

  // ** Lesson Progress **
  public type LessonProgress = {
    lessonId : Text;
    courseId : CourseId;
    isCompleted : Bool;
    completedAt : ?Time.Time;
  };

  let lessonProgress = Map.empty<Principal, Map.Map<Nat, LessonProgress>>();

  public shared ({ caller }) func markLessonComplete(courseId : CourseId, lessonId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark lessons complete");
    };
    ignore getOrTrap(caller);
    // Verify enrollment
    if (not isEnrolledInternal(caller, courseId)) {
      Runtime.trap("Must be enrolled in course to mark lessons complete");
    };
    let progress : LessonProgress = {
      lessonId;
      courseId;
      isCompleted = true;
      completedAt = ?Time.now();
    };
    let existing = switch (lessonProgress.get(caller)) {
      case (null) { Map.empty<Nat, LessonProgress>() };
      case (?existing) { existing };
    };
    existing.add(existing.size(), progress);
    lessonProgress.add(caller, existing);
  };

  public query ({ caller }) func getMyLessonProgress(courseId : CourseId) : async [LessonProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lesson progress");
    };
    let progressArray = switch (lessonProgress.get(caller)) {
      case (null) { [] };
      case (?map) { map.values().toArray() };
    };
    progressArray.filter(func(p) { p.courseId == courseId });
  };

  // ** Quiz Attempts **
  public type QuizAttempt = {
    quizId : Text;
    courseId : CourseId;
    attemptNumber : Nat;
    score : Nat;
    pointsEarned : Nat;
    completedAt : Time.Time;
  };

  let quizAttempts = Map.empty<Principal, Map.Map<Nat, QuizAttempt>>();

  public shared ({ caller }) func submitQuizAttempt(courseId : CourseId, quizId : Text, score : Nat, pointsEarned : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz attempts");
    };
    ignore getOrTrap(caller);
    // Verify enrollment
    if (not isEnrolledInternal(caller, courseId)) {
      Runtime.trap("Must be enrolled in course to submit quiz attempts");
    };
    let existingAttempts = switch (quizAttempts.get(caller)) {
      case (null) { Map.empty<Nat, QuizAttempt>() };
      case (?existing) { existing };
    };
    let attemptNumber = existingAttempts.values().filter(func(a) { a.courseId == courseId and a.quizId == quizId }).size() + 1;
    let attempt : QuizAttempt = {
      quizId;
      courseId;
      attemptNumber;
      score;
      pointsEarned;
      completedAt = Time.now();
    };
    existingAttempts.add(existingAttempts.size(), attempt);
    quizAttempts.add(caller, existingAttempts);
    // Award points internally
    addPointsInternal(caller, pointsEarned);
  };

  public query ({ caller }) func getMyQuizAttempts(courseId : CourseId, quizId : Text) : async [QuizAttempt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quiz attempts");
    };
    let attemptsArray = switch (quizAttempts.get(caller)) {
      case (null) { [] };
      case (?map) { map.values().toArray() };
    };
    attemptsArray.filter(func(a) { a.courseId == courseId and a.quizId == quizId });
  };

  // ** Course Completion **
  public shared ({ caller }) func completeCourse(courseId : CourseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete courses");
    };
    // Verify enrollment
    if (not isEnrolledInternal(caller, courseId)) {
      Runtime.trap("Must be enrolled in course to complete it");
    };
    let existing = switch (enrollments.get(caller)) {
      case (null) { Runtime.trap("Enrollment not found") };
      case (?existing) { existing };
    };
    // Find and update existing enrollment for courseId
    var found = false;
    for ((key, enrollment) in existing.entries()) {
      if (enrollment.courseId == courseId) {
        let updated = {
          enrollment with
          isCompleted = true;
          completedAt = ?Time.now();
        };
        existing.add(key, updated);
        found := true;
      };
    };
    if (not found) {
      Runtime.trap("Enrollment not found");
    };
  };

  public query ({ caller }) func getMyCourseCompletions() : async [Enrollment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view course completions");
    };
    let completionsArray = switch (enrollments.get(caller)) {
      case (null) { [] };
      case (?map) { map.values().toArray() };
    };
    completionsArray.filter(func(e) { e.isCompleted });
  };

  // ** Reviews **
  public type Review = {
    courseId : CourseId;
    principal : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  let reviews = Map.empty<CourseId, Map.Map<Principal, Review>>();

  public shared ({ caller }) func submitReview(courseId : CourseId, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be 1-5");
    };
    ignore getOrTrap(caller);
    let course = switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) { course };
    };
    if (not course.isPublished) {
      Runtime.trap("Course not published");
    };
    if (course.instructorId == caller) {
      Runtime.trap("Instructors cannot review their own courses");
    };
    if (comment == "") {
      Runtime.trap("Comment must not be empty");
    };
    if (comment.size() <= 3) {
      Runtime.trap("Comment must be at least 3 characters");
    };
    let review : Review = {
      courseId;
      principal = caller;
      rating;
      comment;
      createdAt = Time.now();
    };
    let existing = switch (reviews.get(courseId)) {
      case (null) { Map.empty<Principal, Review>() };
      case (?existing) { existing };
    };
    existing.add(caller, review);
    reviews.add(courseId, existing);
  };

  public query ({ caller }) func getCourseReviews(courseId : CourseId) : async [Review] {
    switch (reviews.get(courseId)) {
      case (null) { [] };
      case (?map) { map.values().toArray() };
    };
  };

  // ** Learner Points & Badges **
  public type Badge = {
    name : Text;
    awardedAt : Time.Time;
  };

  let points = Map.empty<Principal, Nat>();
  let badges = Map.empty<Principal, [Badge]>();

  func addPointsInternal(principal : Principal, amount : Nat) {
    let existing = switch (points.get(principal)) {
      case (null) { 0 };
      case (?existing) { existing };
    };
    points.add(principal, existing + amount);
  };

  public query ({ caller }) func getMyPoints() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view points");
    };
    switch (points.get(caller)) {
      case (null) { 0 };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func awardBadge(principal : Principal, badgeName : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can award badges");
    };
    ignore getOrTrap(principal);
    let badge : Badge = {
      name = badgeName;
      awardedAt = Time.now();
    };
    let existing = switch (badges.get(principal)) {
      case (null) { [] };
      case (?existing) { existing };
    };
    badges.add(principal, existing.concat([badge]));
  };

  public query ({ caller }) func getMyBadges() : async [Badge] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view badges");
    };
    switch (badges.get(caller)) {
      case (null) { [] };
      case (?array) { array };
    };
  };

  // Helper function to check enrollment
  func isEnrolledInternal(principal : Principal, courseId : CourseId) : Bool {
    switch (enrollments.get(principal)) {
      case (null) { false };
      case (?map) {
        map.values().any(func(e) { e.courseId == courseId });
      };
    };
  };

  // ** Reporting Data **
  public type LearnerCourseReport = {
    learnerPrincipal : Principal;
    courseId : CourseId;
    completedLessons : Nat;
    enrolledAt : Time.Time;
    startedAt : ?Time.Time;
    completedAt : ?Time.Time;
    isCompleted : Bool;
  };

  public query ({ caller }) func getReportingData() : async [LearnerCourseReport] {
    let callerProfile = getOrTrap(caller);
    if (callerProfile.role != #admin and callerProfile.role != #user) {
      Runtime.trap("Unauthorized: Only admins and instructors can view reporting data");
    };
    let result = Map.empty<Text, LearnerCourseReport>();
    for ((learner, enrollMap) in enrollments.entries()) {
      for ((_, enrollment) in enrollMap.entries()) {
        let courseId = enrollment.courseId;
        let progressArr = switch (lessonProgress.get(learner)) {
          case (null) { [] };
          case (?pMap) {
            pMap.values().filter(func(p) { p.courseId == courseId and p.isCompleted }).toArray()
          };
        };
        // Deduplicate lesson IDs and find earliest completion
        let seen = Map.empty<Text, Bool>();
        var completedCount = 0;
        var firstCompletion : ?Time.Time = null;
        for (p in progressArr.vals()) {
          if (not seen.containsKey(p.lessonId)) {
            seen.add(p.lessonId, true);
            completedCount += 1;
            switch (p.completedAt) {
              case (null) {};
              case (?t) {
                switch (firstCompletion) {
                  case (null) { firstCompletion := ?t };
                  case (?existing) {
                    if (t < existing) { firstCompletion := ?t };
                  };
                };
              };
            };
          };
        };
        let key = learner.toText() # "-" # courseId.toText();
        let report : LearnerCourseReport = {
          learnerPrincipal = learner;
          courseId;
          completedLessons = completedCount;
          enrolledAt = enrollment.enrolledAt;
          startedAt = firstCompletion;
          completedAt = enrollment.completedAt;
          isCompleted = enrollment.isCompleted;
        };
        result.add(key, report);
      };
    };
    result.values().toArray();
  };
};
