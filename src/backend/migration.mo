import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type CourseId = Nat;
  type ProfileId = Nat;

  type OldActor = {
    profiles : Map.Map<ProfileId, UserProfile>;
    users : Map.Map<Principal, ProfileId>;
    courses : Map.Map<Nat, Course>;
    nextProfileId : Nat;
    nextCourseId : Nat;
  };

  type NewActor = {
    profiles : Map.Map<ProfileId, UserProfile>;
    users : Map.Map<Principal, ProfileId>;
    courses : Map.Map<Nat, Course>;
    enrollments : Map.Map<Principal, Map.Map<Nat, Enrollment>>;
    nextProfileId : Nat;
    nextCourseId : Nat;
    lessonProgress : Map.Map<Principal, Map.Map<Nat, LessonProgress>>;
    quizAttempts : Map.Map<Principal, Map.Map<Nat, QuizAttempt>>;
    reviews : Map.Map<CourseId, Map.Map<Principal, Review>>;
    points : Map.Map<Principal, Nat>;
    badges : Map.Map<Principal, [Badge]>;
  };

  type UserProfile = {
    id : ProfileId;
    principal : Principal;
    name : Text;
    email : Text;
    avatarUrl : Text;
    role : {
      #admin;
      #user;
      #guest;
    };
    createdAt : Time.Time;
  };

  type Course = {
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

  type Enrollment = {
    principal : Principal;
    courseId : CourseId;
    enrolledAt : Time.Time;
    isCompleted : Bool;
    completedAt : ?Time.Time;
  };

  type LessonProgress = {
    lessonId : Text;
    courseId : CourseId;
    isCompleted : Bool;
    completedAt : ?Time.Time;
  };

  type QuizAttempt = {
    quizId : Text;
    courseId : CourseId;
    attemptNumber : Nat;
    score : Nat;
    pointsEarned : Nat;
    completedAt : Time.Time;
  };

  type Review = {
    courseId : CourseId;
    principal : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  type Badge = {
    name : Text;
    awardedAt : Time.Time;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      enrollments = Map.empty<Principal, Map.Map<Nat, Enrollment>>();
      lessonProgress = Map.empty<Principal, Map.Map<Nat, LessonProgress>>();
      quizAttempts = Map.empty<Principal, Map.Map<Nat, QuizAttempt>>();
      reviews = Map.empty<CourseId, Map.Map<Principal, Review>>();
      points = Map.empty<Principal, Nat>();
      badges = Map.empty<Principal, [Badge]>();
    };
  };
};
