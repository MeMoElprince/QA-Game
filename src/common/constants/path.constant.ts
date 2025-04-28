import { join } from 'path';

export const ROOT_PATH = process.cwd();
export const UPLOAD_PATH = join(ROOT_PATH, 'uploads');
export const CLIENT_SIDE_PATH = join('/home/osbash/actions-runner/_work/Rakez_Faker-front/Rakez_Faker-front', 'build');
// export const CLIENT_SIDE_PATH = join(ROOT_PATH, 'build');
// export const ADMIN_SIDE_PATH = join('/root/actions-runner/_work/faker_rakez_admin_dash/faker_rakez_admin_dash', 'dist');
export const ADMIN_SIDE_PATH = join(ROOT_PATH, 'dist');
export const VIEW_PATH = join(ROOT_PATH, 'views');
