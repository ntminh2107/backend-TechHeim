enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,

  BAD_REQUEST = 400,
  NOT_MATCH = 401,
  NOT_FOUND = 404,
  NOT_ALLOWED = 403,
  TIME_OUT = 405,

  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502
}
export default HttpStatusCode
