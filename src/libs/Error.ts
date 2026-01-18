export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong!",
  NO_DATA_FOUND = "No data is found!",
  TOKEN_CREATION_FAILED = "Token creation error",
  CREATE_FAILED = "Create is failed!",
  UPDATE_FAILED = "Update is failed!",
  USED_NICK_PHONE = "You are inserting already used nick or phone!",
  WRONG_PASSWORD = "Wrong password, please try again!",
  NO_MEMBER_NICK = "No member with that member nick!",
  NOT_AUTHENTICATED = "You are not authenticated, Please login first!",
  BLOCKED_USER = "You have been blocked, please contact admin!",
  NEGATIVE_PRICE = "Product price cannot be negative!",
  NEGATIVE_COUNT = "Product count cannot be negative!",
  NEGATIVE_PAGE_COUNT = "Page count cannot be negative!",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}

export default Errors;
