import * as auth from './modules/auth';
import * as users from './modules/users';
import * as courses from './modules/courses';
import * as assignments from './modules/assignments';
import * as exams from './modules/exams';
import * as certificates from './modules/certificates';
import * as teachers from './modules/teachers';
import * as dashboard from './modules/dashboard';
import * as analytics from './modules/analytics';

export { default as client } from './client';
export type { ApiResponse, PaginatedResult } from './client';

export {
  auth,
  users,
  courses,
  assignments,
  exams,
  certificates,
  teachers,
  dashboard,
  analytics,
};
