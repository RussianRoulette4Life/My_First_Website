const express = require('express')
//--//
const {connectToDb, getDb} = require('./db')
const fs = require('fs')
const { ObjectId } = require('mongodb')

//-----//
const app = express()

app.use(express.json())

console.log('ey')
let db
connectToDb((err)=>{
  if (!err){
    app.listen(3000, ()=>{
      console.log('you got here')
    })
    db = getDb()
  } else{
    console.log(err, "u messed up")
  }
})
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=>{
  res.render('index', {title:'My blog?'})
})

app.get('/json', (req,res)=>{
  let comments = []

  db.collection('comments')
  .find()
  .sort({author:1})
  .forEach(comment => comments.push(comment))
  .then(()=>{
    res.status(200).json(comments)
  })
  .catch(()=>{
    res.status(500).json({error: "couldnt fetch documents"})
  })
})

app.get('/json/:id', (req,res)=>{
  
  if (ObjectId.isValid(req.params.id)){
    db.collection('comments')
    .findOne({_id: new ObjectId(req.params.id)})
    .then(doc=>{
      res.status(200).json(doc)
    })
    .catch((err)=>{
      res.status(500).json({error:'couldnt fetch :('})
    })
  } else {
    res.status(500).json({error: 'not a valid id'})
  }
})

app.post('/', (req,res)=>{
  const comment = req.body

  console.log(comment)

  db.collection('comments')
  .insertOne(comment)
  .then(result =>{
    res.status(201).send(result)
  }, err =>{
    res.status(500).json({error: 'couldnt do it lad'})
  })
})

app.delete('/json/:id', (req,res)=>{ 

  if (ObjectId.isValid(req.params.id)){
    db.collection('comments')
    .deleteOne({_id: new ObjectId(req.params.id)})
    .then(result=>{
      res.status(200).json(result)
    })
    .catch((err)=>{
      res.status(500).json({error:'couldnt delete :('})
    })
  } else {
    res.status(500).json({error: 'not a valid id'})
  }
})

//app.patch('/json/:id', (req,res)=>{

  //const update = req.body
//
  //console.log(update)
//
  //if (ObjectId.isValid(req.params.id)){
  //  db.collection('comments')
  //  .updateOne({_id: new ObjectId(req.params.id)}, {$set: update})
  //  .then(result=>{
  //    res.status(200).json(result)
  //  })
  //  .catch((err)=>{
  //    res.status(500).json({error:`couldnt update :( ${err}`})
  //  })
  //} else {
  //  res.status(500).json({error: 'not a valid id'})
  //}
//})

app.patch('/json/:id', (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {

    db.collection('comments')
      .updateOne({ _id: new ObjectId(req.params.id) }, {$set: updates})
      .then(result => {
        res.status(200).json(result)
      })
      .catch(err => {
        res.status(500).json({error: 'Could not update document'})
      })

  } else {
    res.status(500).json({error: 'Could not update document'})
  }
})

app.use((req,res)=>{
  res.render('404', {title:'!404!'})
})
