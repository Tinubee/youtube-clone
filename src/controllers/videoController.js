import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const picture = async (req, res) => {
  const number = parseInt(Math.random() * 32) + 1;
  const imgUrl =
    "https://res.cloudinary.com/dmvu7wol7/image/upload/v1647151572/부기/부기" +
    number +
    ".jpg";
  return res.render("picture", { pageTitle: "picture", imgUrl, number });
};

export const likeVideos = async (req, res) => {
  const { user } = req.session;
  let likeVideos = [];
  const myData = await User.findById(user._id).populate("likevideos");

  console.log(myData);

  for (let i = 0; i < myData.likevideos.length; i++) {
    const find = await Video.findById(myData.likevideos[i]._id).populate(
      "owner"
    );
    likeVideos.push(find);
  }

  return res.render("likevideos", { pageTitle: "Like Videos", likeVideos });
};

export const subscribeUser = async (req, res) => {
  const { user } = req.session;
  const myData = await User.findById(user._id).populate("subsript");
  const subscribe = myData.subsript;

  return res.render("subscribe", { pageTitle: "Subscribe User", subscribe });
};

export const hashtaghome = async (req, res) => {
  const { hashtag } = req.params;

  const searchVideos = [];
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");

  for (let i = 0; i < videos.length; i++) {
    if (videos[i].hashtags.includes("#" + hashtag)) {
      searchVideos.push(videos[i]);
    }
  }

  const allHashtags = ["전체"];
  for (let i = 0; i < videos.length; i++) {
    allHashtags.push(...videos[i].hashtags);
  }
  const hashtags = [...new Set(allHashtags)];

  return res.status(200).render("hashtaghome", {
    pageTitle: "HashTag Home",
    searchVideos,
    hashtags,
  });
};

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");

  const allHashtags = ["전체"];
  for (let i = 0; i < videos.length; i++) {
    allHashtags.push(...videos[i].hashtags);
  }
  const hashtags = [...new Set(allHashtags)];

  return res.render("home", { pageTitle: "Home", videos, hashtags });
};

export const watch = async (req, res) => {
  let existLength = 0;
  let isSubsLength = 0;
  const { user } = req.session;
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate("owner")
    .populate("like")
    .populate("comments");

  if (user) {
    const findUser = await User.findById(user._id)
      .populate("likevideos")
      .populate("subsript");
    const exist = video.like.filter((e) => e.username === findUser.username);
    const isSubs = findUser.subsript.filter(
      (e) => e.username === video.owner.username
    );
    isSubsLength = isSubs.length;
    existLength = exist.length;
  }

  let comments = [];

  for (let i = 0; i < video.comments.length; i++) {
    let commentOwner = await video.comments[i].populate("owner");
    comments.push(commentOwner);
  }

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", {
    pageTitle: video.title,
    video,
    comments,
    existLength,
    isSubsLength,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) != String(_id)) {
    req.flash("error", "You can't edit this video");
    return res.status("403").redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const { thumb } = req.files;
  const isHeroku = process.env.NODE_ENV === "production";

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) != String(_id)) {
    return res.status("403").redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
    thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
  });

  req.flash("success", "Video updated successfully");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";

  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (err) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: err._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }

  if (String(video.owner) != String(_id)) {
    return res.status("403").redirect("/");
  }

  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (video) {
    video.meta.views += 1;
    await video.save();
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  } else {
    const comment = await Comment.create({
      text,
      owner: user._id,
      video: id,
    });

    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({ newCommentId: comment._id, user });
  }
};

export const deleteComment = async (req, res) => {
  const {
    params: { id, commentid },
  } = req;

  const video = await Video.findById(id).populate("comments");

  video.comments = video.comments.filter(
    (e) => String(e._id) !== String(commentid)
  );

  await video.save();

  return res.sendStatus(201);
};

export const like = async (req, res) => {
  const { id } = req.params;
  const { user } = req.session;

  const video = await Video.findById(id).populate("like");

  if (!video) return res.sendStatus(404);

  if (user) {
    const findUser = await User.findById(user._id).populate("likevideos");
    const exist = video.like.find((e) => String(e._id) === String(user._id));

    if (exist === undefined) {
      video.like.push(findUser);
      findUser.likevideos.push(video);
    } else {
      video.like = video.like.filter((e) => String(e._id) !== String(user._id));
      findUser.likevideos = findUser.likevideos.filter(
        (e) => String(e._id) !== String(id)
      );
    }
    await video.save();
    await findUser.save();
  } else {
    req.flash("error", "동영상에 좋아요를 누르시려면 로그인을 해주세요.");
  }

  return res.sendStatus(200);
};

export const userSubscript = async (req, res) => {
  const { id } = req.params; //구독할 아이디 -> subscriber에 user 추가
  const { user } = req.session; //내 아이디 -> subsript에 id 추가

  if (user) {
    const subscriptUser = await User.findById(id)
      .populate("subscriber")
      .populate("subsript");

    const findMe = await User.findById(user._id)
      .populate("subsript")
      .populate("subscriber");

    const alreadySubs = findMe.subsript.filter(
      (e) => e.username === subscriptUser.username
    );

    if (alreadySubs.length === 0) {
      subscriptUser.subscriber.push(user);
      findMe.subsript.push(subscriptUser);
    } else {
      subscriptUser.subscriber = subscriptUser.subscriber.filter(
        (e) => String(e._id) !== String(user._id)
      );
      findMe.subsript = findMe.subsript.filter(
        (e) => String(e._id) !== String(subscriptUser._id)
      );
    }
    await subscriptUser.save();
    await findMe.save();
  } else {
    return res.sendStatus(400);
  }

  return res.sendStatus(200);
};
