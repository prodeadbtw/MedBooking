// Этот файл «экспортирует» всё из папки constants.
// Благодаря ему можно писать:
// import { Colors, Typography, Spacing } from '../constants';
// Вместо трёх отдельных импортов из трёх файлов.

export { default as Colors } from './Color';
export { default as Spacing } from './Spacing';
export { default as Typography } from './Typography';

