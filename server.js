const axios = require('axios');
const express = require('express');
const apps = express();
const cors = require('cors');
const mongoose = require('mongoose');
const db = 'mongodb://adylau97:yitchin97@ds037498.mlab.com:37498/wallpaperdb';

var bodyParser = require('body-parser');   
var Schema = mongoose.Schema;
var imageSchema = new Schema({
  url: {type: String},
  uid: {type: String}
});
var model = mongoose.model('Image', imageSchema, 'Image');

apps.use(cors());
apps.use(bodyParser.json({limit:'5mb'}));
apps.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  

apps.listen(5000, ()=>{
  console.log('Connecting...');
});

apps.get('/getImage/:page/:q',(req,res)=>{

var all_image=[];
const API_KEY = '10095037-097333a2362dace817e1654de';
const URL = `https://pixabay.com/api/?key=${API_KEY}&page=${req.params.page}&q=${req.params.q}&safesearch=true&per_page=10`;

const API_KEY2 = 'cc6398ae068dba779b6427340785f6929a54eac51baddaf486180031af467777';
const URL2 = `https://api.unsplash.com/search/photos?client_id=${API_KEY2}&page=${req.params.page}&query=${req.params.q}&per_page=10`;

  axios.get(URL)
    .then(function (response){
      if(response.data.totalHits>0){
        //res.send(response.data.hits);
        all_image = all_image.concat(response.data.hits);

        axios.get(URL2)
        .then((response)=>{

          if(response.data.total>0){
            //res.send(response.data.results);

            //console.log((response.data.results).length);
            var i;
            for(i=0;i<(response.data.results).length;i++){
              var data={
                largeImageURL: response.data.results[i].urls.regular,
                id:response.data.results[i].id,
                tags:response.data.results[i].tags[0].title,
                user:response.data.results[i].user.name
              };

              all_image = all_image.concat(data);

              if(i==(response.data.results).length-1){
                res.send(all_image);
              }
            }

            //all_image = all_image.concat(response.data.results);
            //res.send(all_image);
          }else{
            console.log('No hits');
          }
         
        })
        .catch(function(error){
          console.log(error);
        });
        
      }else{
        console.log('No hits');
      }
    })
    .catch(function(error){
      console.log(error);
    });

});


mongoose.connect(db, { useNewUrlParser : true})
.then(()=>{
  console.log('Connected to mongodb');
})
.catch(error=>{
  console.log(error);
});

apps.get('/getFavorite/:uid',(req,res)=>{
  //console.log("test "+req.params.uid);
  model.find({uid:req.params.uid},function(err,data){
    if(err){
      res.send(err);
    }else{
      res.send(data);
    }
  });
});

apps.delete('/removeFavorite',function(req,res){
  model.deleteOne({_id: req.body.id}, function(err){
    if(err){  
      res.send(err);  
    }else{    
      res.send({data:"Img has been Deleted..!!"});             
    }  
  });
});

apps.post('/addFavorite',function(req,res){
  var mod = new model(req.body);
  //console.log(req.body);
  mod.save(function(err){
    if(err){
      res.send(err);
    }else{
      res.send({data:"Img has been Added..!!"})
    }
  })
});

apps.post('/signUp',function(req,res){
  axios({method:'post',url:'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyD14synFX4iAmDosT6mWUrbRMhf7NfNzLk',data:{email: req.body.email ,password: req.body.password,returnSecureToken:true}})
  .then(response=>{
    res.send({success:true,message:response.data});
  })
  .catch(function(err){
    res.send({success:false,message:err.response.data.error.message});
    //console.log(err.response.data.error.message);
  })
});

apps.post('/signIn',function(req,res){
  axios({method:'post',url:'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyD14synFX4iAmDosT6mWUrbRMhf7NfNzLk',data:{email: req.body.email ,password: req.body.password,returnSecureToken:true}})
  .then(response=>{
    res.send({success:true,message:response.data});
  })
  .catch(err=>{
    res.send({success:false,message:err.response.data.error.message});
  })

});

