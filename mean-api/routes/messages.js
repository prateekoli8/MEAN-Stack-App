const express = require('express');
const multer = require('multer');

const router = express.Router();

const checkAuth  = require('../middleware/check-auth');

const Post = require('../models/posts');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

router.get('/posts' , (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.then(posts => {
            fetchedPosts = posts;
            return Post.count();
            })
            .then (count => {
                res.status(200).json({
                    message: 'Data Sent Successfully',
                    posts: fetchedPosts,
                    maxPosts: count
            });
        }
    ).catch(err => {res.status(500).json({ message: 'Fetching the posts failed'})});
    
});

router.get('/post/:id', (req, res, next) => {
    Post.findById(req.params.id).then( post => {
        if(post) {
            res.status(200).json({message: 'Post Found!', post: post});
        } else {
            res.status(404).json({message: 'Post Not Found'});
        }
    }).catch(err => {res.status(500).json({ message: 'Fetching the posts failed'})});
});

router.post('/posts' , checkAuth, multer({storage: fileStorage, fileFilter: fileFilter}).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save()
    .then(
        post => {
            res.status(201).json({
                message: 'Post added successfully',
                post: {
                    ...post,
                    id: post._id
                }
            });
        }
    ).catch (err => { res.status(500).json({ message: 'Creating a post Failed!' }) });
    
});

router.put('/post/:id' ,checkAuth , multer({storage: fileStorage, fileFilter: fileFilter}).single('image') , (req, res ,next) => {
   let imagePath = req.body.imagePath;
   console.log('Got: ' + imagePath);
   if(req.file) {
       const url = req.protocol + '://' + req.get('host');
       imagePath = url + '/images/' + req.file.filename;
       console.log('Saved: ' + imagePath);
   }
    const post = new Post({
       _id: req.body.id,
       title: req.body.title,
       content: req.body.content,
       imagePath: imagePath,
       creator: req.userData.userId
   });
   console.log('post:' + post );
   Post.updateOne({_id: req.body.id, creator: req.userData.userId}, post).then(result => {
       if (result.n > 0 ) {
        res.status(200).json({message: 'Updated Successfully'});
       } else {
           res.status(401).json({message: 'Update Failed. Authorization Failed'});
       }
       
   }).catch(err => {
       res.status(500).json({message: 'Updating the post failed'});
   } );
});

router.delete('/posts/:id' , checkAuth ,(req, res, next) => {

    Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(
        result => {
            if (result.n > 0 ) {
                res.status(200).json({message: 'Deleted Successfully'});
               } else {
                   res.status(401).json({message: 'Delete Failed. Authorization Failed'});
               }
        }
    ).catch(err => {res.status(500).json({message: 'Deleting the post failed!'})});
});

module.exports = router;