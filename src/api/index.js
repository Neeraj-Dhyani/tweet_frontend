import client, {getclient} from "./client";
import { unwrap, publicUser } from "../utils";

const A = "/api/v1";

const emptyOn404 = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (e) {
    if (e.response?.status === 404) return [];
    throw e;
  }
};

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

/* ---------- /api/v1/users (JWT) ---------- */
export function registerUser({ username, password, email, bio, file }) {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);
  form.append("email", email);
  if (bio) form.append("bio", bio);
  if (file) form.append("file", file);
  return client.post(`${A}/users/register`, form, multipart);
}
export const loginUser = ({ username, password }) =>
  client.post(`${A}/users/login`, { username, password });
export const getCurrentUser = () => client.get(`${A}/users/getuser`);
export function uploadAvatar(file) {
  const form = new FormData();
  form.append("file", file);
  return client.put(`${A}/users/uploadavatar`, form, multipart);
}
export const removeAvatar = () => client.delete(`${A}/users/removeavatar`);
export const updateUser = ({ username, email }) =>
  client.put(`${A}/users/updateuser`, { username, email });
// Bio_content schema wasn't shared; adjust the key if it isn't "bio".
export const updateUserBio = (bio) => client.put(`${A}/users/updateuserbio`, { bio });
export const deleteAccount = () => client.delete(`${A}/users/deleteuser`);
export const followUser = (username) => client.post(`${A}/users/following`, { username });
export const unfollowUser = (username) =>
  client.delete(`${A}/users/unfollowing`, { data: { username } });

/* ---------- /api/v1 (API key) reads ---------- */
export async function getAllUsers() {
  const r = await getclient.get(`${A}/all_user`);
  return (r.data.users || []).map(publicUser);
}
export async function getUserById(id) {
  const r = await getclient.get(`${A}/getiuserbyid`, { params: { user_id: id } });
  return publicUser(r.data.users);
}
export async function getAllTweets() {
  const r = await getclient.get(`${A}/getalltweet`);
  return (r.data.tweets || []).map(unwrap);
}
export async function getTweetById(id) {
  const r = await getclient.get(`${A}/gettweetbyid`, { params: { tweet_id: id } });
  return unwrap(r.data.tweet);
}
export const getTweetsByUser = emptyOn404(async (userId) => {
  const r = await getclient.get(`${A}/gettweetsbyuser`, { params: { user_id: userId } });
  return (r.data.user_tweet || []).map(unwrap);
});
export async function getAllComments() {
  const r = await getclient.get(`${A}/getallcomment`);
  return (r.data.comments || []).map(unwrap);
}
export const getRepliesByComment = emptyOn404(async (commentId) => {
  const r = await getclient.get(`${A}/getallreplybycomment`, { params: { comment_id: commentId } });
  return (r.data.reply || []).map(unwrap);
});

/* ---------- /api/v1/tweet (JWT) ---------- */
export function postTweet({ content, files = [] }) {
  const form = new FormData();
  form.append("content", content);
  files.forEach((f) => form.append("image_files", f));
  return client.post(`${A}/tweet/posttweet`, form, multipart);
}
export const deleteTweet = (id) => client.delete(`${A}/tweet/deletetweet`, { params: { tweet_id: id } });
export const toggleSupport = (id) => client.post(`${A}/tweet/support`, null, { params: { post_id: id } });

/* ---------- /api/v1/comment (JWT) ----------
   The backend declares the text params as plain query params
   (comment_conten / update_conten / message), so we send them that way. */
export const commentOnTweet = (tweetId, text) =>
  client.post(`${A}/comment/commenttweet`, null, { params: { tweet_id: tweetId, comment_conten: text } });
export const editComment = (commentId, text) =>
  client.put(`${A}/comment/editcomment`, null, { params: { comment_id: commentId, update_conten: text } });
export const deleteComment = (commentId) =>
  client.delete(`${A}/comment/deletecomment`, { params: { comment_id: commentId } });
export const replyToComment = (commentId, text) =>
  client.post(`${A}/comment/replycomment`, null, { params: { comment_id: commentId, message: text } });
export const deleteReply = (replyId) =>
  client.delete(`${A}/comment/deletereplycomment`, { params: { reply_comment_id: replyId } });
