import { join } from 'path';

export const ROOT_PATH = process.cwd();
export const UPLOAD_PATH = join(ROOT_PATH, 'uploads');
export const CLIENT_SIDE_PATH = join(ROOT_PATH, 'client', 'build');
export const VIEW_PATH = join(ROOT_PATH, 'views');
