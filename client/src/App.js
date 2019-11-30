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
import Collapse from '@material-ui/core/Collapse';

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
    toRender: new Set
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDbWithLocation();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDbWithLocation, 5000);
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
      }})
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

  //helper that toggles the existence of an id in our map
  //never modify state directly
  toggleState = (id) => {
    console.log('toggling state');
    if(this.state.toRender.has(id))
    {
      var tempSet = this.state.toRender;
      tempSet.delete(id);
      this.setState({ toRender: tempSet })
    }
    else
    {
      var tempSet = this.state.toRender;
      tempSet.add(id);
      this.setState({ toRender: tempSet })
    }
  }

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
                <Paper style={{width: 900}}>
                  <Typography variant="h5" component="h3"
                  onClick={() => 
                    this.toggleState(dat._id)}>
                    {dat.title}
                  </Typography>
                  <Typography component="p"
                  onClick={() => 
                    this.toggleState(dat._id)}>
                    {dat.message}
                  </Typography>
                  <div>{"\n"}</div>

                  <Collapse in={this.state.toRender.has(dat._id)}>
                    <div style={{width: 850}}>
                      {
                        dat.children <= 0
                        ? 'No comments yet!'
                        : dat.children.map((com) => (
                          <>
                          <Divider/>
                          <ListItem >
                            <ListItemText align='center' primary = {com}/>
                          </ListItem>
                          </>
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
                  </Collapse>
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
          <div>{"\n"}</div>
          <TextField
            variant="filled"
            style = {{width: '300px'}}
            onChange={(e) => this.setState({ message: e.target.value })}
            placeholder="post text"
          />
          <div>{"\n"}</div>
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