import { callApi } from './auth';

export async function getArticles() {
  return callApi('GET', '/Wardrobe/articles');
}