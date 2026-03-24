import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
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

  public type CreateUserProfileDto = {
    name : Text;
    email : Text;
  };

  public type UpdateUserProfileDto = {
    name : Text;
    email : Text;
  };

  public type UserProfile = {
    id : ProfileId;
    principal : Principal;
    name : Text;
    email : Text;
    avatarUrl : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
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

  public type CreateCourseDto = {
    title : Text;
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

  public query func getCourses() : async [Course] {
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

  /// Profile-Specific Queries
  public shared ({ caller }) func registerProfile(createProfileDto : CreateUserProfileDto) : async UserProfile {
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

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other profiles");
    };
    getOrTrap(user);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not users.containsKey(caller)) {
      return null;
    };
    ?getOrTrap(caller);
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

  public query ({ caller }) func getUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    profiles.values().toArray();
  };

  public query ({ caller }) func getUserCount() : async Nat {
    users.size();
  };

  public query ({ caller }) func isAdmin() : async Bool {
    isRegisteredInternal(caller) and AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func isInstructor() : async Bool {
    (isRegisteredInternal(caller) and AccessControl.isAdmin(accessControlState, caller));
  };

  public query ({ caller }) func doesAdminExist() : async Bool {
    switch (firstAdmin()) {
      case (null) { false };
      case (_) { true };
    };
  };

  public shared ({ caller }) func seedFirstAdmin() : async () {
    if (firstAdmin() != null) {
      Runtime.trap("Admin already exists, cannot override");
    };
    let isRegistered = isRegisteredInternal(caller);
    if (not isRegistered) {
      ignore await registerProfile({ name = "Admin"; email = "" });
    };
    updateRoleProfile(caller, #admin);
  };

  func isRegisteredInternal(principal : Principal) : Bool {
    users.containsKey(principal);
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

  func updateRoleProfile(principal : Principal, role : AccessControl.UserRole) {
    updateProfile(principal, null, null, ?role);
  };
};
