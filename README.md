# Wire — Twitter-style React frontend

```bash
npm install
npm run dev
```

Config lives in `.env` (already filled in with your host and API key):

```
VITE_API_HOST=https://fastapitweetbackend.vercel.app
VITE_API_KEY=...
VITE_API_KEY_HEADER=x-api-key   # change if your api_key_auth reads a different header
```

## Screens
- `/login`, `/register`
- `/` Home: compose (text + up to 4 images), feed, support (like), delete own post
- `/tweet/:id` Post detail: comments (add / edit / delete) and replies
- `/user/:id` Profile: user's posts, follow / unfollow
- `/settings` Avatar, username/email, bio, delete account

## Which API each screen uses
| Feature | Endpoint | Auth |
|---|---|---|
| Feed | GET /api/v1/getalltweet | API key |
| Post detail | GET /api/v1/gettweetbyid | API key |
| Profile posts | GET /api/v1/gettweetsbyuser | API key |
| Authors, who to follow | GET /api/v1/all_user, /getiuserbyid | API key |
| Comments | GET /api/v1/getallcomment, POST/PUT/DELETE /api/v1/comment/* | API key + JWT |
| Replies | GET /api/v1/getallreplybycomment, POST/DELETE /api/v1/comment/replycomment | API key + JWT |
| Post / delete / support | /api/v1/tweet/posttweet, deletetweet, support | JWT |
| Account, follow | /api/v1/users/* | JWT |

## Backend issues that will show up in the UI
- `/all_user` uses `.dicts` without `()` so it will 500, and it would return password hashes. Fix: `.dicts()` and exclude `password`. Until then, authors load one by one via `/getiuserbyid` and "Who to follow" stays empty.
- `/getcommentbyuser` is defined twice and takes `api_key=(api_key_auth)` instead of `Depends(...)`.
- `/tweet/support`: `post_id=str` should be `post_id: str`, and on un-support `tweet.save` is missing `()`, so the count never goes down in the database.
- Comment routes declare `comment_conten=Message` (and `update_conten`, `message`) as default values, not body types, so the UI sends them as query params. `reply_comment` looks up `Tweet.id` instead of `Comment.id` and creates the reply with `comment=` although the field is `Comment`. `deletereplycomment` has the owner check inverted and calls `ReplyComment.delete_instance()` on the class.
- There's no endpoint for "who do I follow" or "did I support this post", so the UI remembers both in localStorage.
- The API key is in the browser bundle, so anyone can read it. Treat it as public.
