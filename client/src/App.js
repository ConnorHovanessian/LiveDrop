// /client/App.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import $ from 'jquery'; 
//Material UI Components
import { makeStyles } from '@material-ui/core/styles';
import 'typeface-roboto';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';


function generate(element) {
  return [0, 1, 2].map(value =>
    React.cloneElement(element, {
      key: value,
    }),
  );
}

class App extends Component {
  // initialize our state
  state = {
    data: [],
    id: 0,
    title: null,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null,
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDbWithLocation();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDbWithLocation, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  // fetch all data from our data base
  getDataFromDb = () => {
    var self = this;
    axios.get('http://localhost:3001/api/getData')
      .then((res) => self.setState({ data: res.data.data}));
  };

  //get all data within a distance from client
  getDataFromDbByID = (ID) => {
    var self = this;
    axios.get('http://localhost:3001/api/getDataByIDs', {
      params: {
        ID: ID
      }
    })
    .then(function (res) {
      self.setState({data: res.data.data})
    })
    }

  //get all data within a distance from client
  getDataFromDbWithLocation = () => {
    var self = this;
    navigator.geolocation.getCurrentPosition(function(position) {
      axios.get('http://localhost:3001/api/getDataWithLocation', {
        params: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      })
      .then(function (res) {
        self.setState({data: res.data.data})
      })
    });
    }


  // put new data into our db
  putDataToDB = (message) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post('http://localhost:3001/api/putData', {
      id: idToBeAdded,
      message: message,
    });
  };

  // add new comment under parent
  putCommentToDB = (message, parentID) => {
    axios.post('http://localhost:3001/api/putComment', {
      message: message,
      parentID: parentID
    });
  };

  // remove existing database information
  deleteFromDB = (idTodelete) => {
    parseInt(idTodelete);
    let objIdToDelete = null;
    this.state.data.forEach((dat) => {
      if (dat.id == idTodelete) {
        objIdToDelete = dat._id;
      }
    });

    axios.delete('http://localhost:3001/api/deleteData', {
      data: {
        id: objIdToDelete,
      },
    });
  };

  // overwrite existing data base information
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    parseInt(idToUpdate);
    this.state.data.forEach((dat) => {
      if (dat.id == idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });

    axios.post('http://localhost:3001/api/updateData', {
      id: objIdToUpdate,
      update: { message: updateToApply },
    });
  };

  putDataToDBWithLocation = (title, message) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      axios.post('http://localhost:3001/api/putData', {
      id: idToBeAdded,
      title: title,
      message: message,
      lon: position.coords.longitude,
      lat: position.coords.latitude
    });
    })
  };

  // UI
  render() {
    console.log("State data: " + JSON.stringify(this.state));
    const { data } = this.state;
    return (
      <div align='center'>
          <Typography variant="h1" color="inherit" noWrap>
            LiveDrop
          </Typography>
        <div>
          {
            data.length <= 0
            ? 'NO DB ENTRIES YET'
            : data.map((dat) => (
                <div style={{ padding: '10px' }} key={data.message}>
                <Paper>
                      <Typography variant="h5" component="h3">
                        {dat.title}
                      </Typography>
                      <Typography component="p">
                        {dat.message}
                      </Typography>

                  <div>{"\n"}</div>

                  <div style={{width: 600}}>
                  {
                    dat.children <= 0
                    ? 'No comments yet!'
                    : dat.children.map((com) => (
                      <ListItem >
                        <ListItemText align='center' primary = {com}/>
                      </ListItem>

                      
                  ))}  
                  </div>
                  <TextField
                    variant="filled"
                    style = {{width: '300px'}}
                    onChange={(e) => this.setState({ comment: e.target.value })}
                    placeholder="comment"
                  />
                  <Button 
                    style={{height: '56px', width: '70px'}}
                    variant = 'outlined'
                    onClick={() => this.putCommentToDB(this.state.comment, dat._id)}>
                      POST 
                  </Button>
                </Paper>
                </div>
              ))}
        </div>

        <div style={{ padding: '10px' }}>
          <TextField
            variant="filled"
            style = {{width: '300px'}}
            onChange={(e) => this.setState({ title: e.target.value })}
            placeholder="title"
          />
          <TextField
            variant="filled"
            style = {{width: '300px'}}
            onChange={(e) => this.setState({ message: e.target.value })}
            placeholder="post text"
          />
          <Button 
            style={{height: '56px', width: '70px'}}
            variant = 'outlined'
            onClick={() => this.putDataToDBWithLocation(this.state.title, this.state.message)}>
              ADD
          </Button>
        </div>
      </div>
    );
  }
}

export default App;