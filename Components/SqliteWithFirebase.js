import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';

import {openDatabase} from 'react-native-sqlite-storage';
import Database from '@react-native-firebase/database';
//import firebase from '@react-native-firebase/app';
const url = 'https://student-record-d4cb0.firebaseio.com/';
import * as firebase from 'firebase';
import {firebaseConfig} from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = openDatabase('StudentDatabase.db');

const windowWidth = Dimensions.get('window').width;

export default class App extends Component {
  constructor(props) {
    super();
    db.DEBUG = true;
    (this.state = {
      students: [],
      name: '',
      adrs: '',
      num: '',
    }),
      db.transaction(function (txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='Students'",
          [],
          function (tx, res) {
            console.log('item:', res.rows.length);
            if (res.rows.length == 0) {
              txn.executeSql('DROP TABLE IF EXISTS Students', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS Students(s_id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(25),contact VARCHAR(25),adrs VARCHAR(255))',
                [],
                () => alert('Successfully Created'),
                () => errorCB(),
              );
            }
          },
        );
      });
  }
  async componentDidMount() {
    // let response= await fetch('https://student-record-d4cb0.firebaseio.com/Student.json');
    // console.log('response', response)
  }
  GetData() {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM Students', [], (tx, results) => {
        console.log('Query completed', results.rows.length);
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        console.log('temp', temp);
        this.setState({students: temp});
      });
    });
  }

  onChangeTextFun(text, field) {
    if (field == 'name') {
      this.setState({name: text});
    }
    if (field === 'num') {
      this.setState({num: text});
    }
    if (field === 'adrs') {
      this.setState({adrs: text});
    }
  }

  AddToDatabase = () => {
    console.log('Adding to database', this.state.name + ' ' + this.state.num);
    db.transaction((txn) => {
      txn.executeSql(
        'INSERT INTO Students (s_id,name,contact,adrs) VALUES (null,?,?,?)',
        [this.state.name, this.state.num, this.state.adrs],
        (tx, res) => {
          console.log('Row Inserted', res);
          this.setState({students: res});
          if (res.rowsAffected == 0) {
            console.log('not inserted');
          } else {
            console.log('data inserted');
          }
        },
      );
    });
  };
  async getDatafromFirebase() {
    const items = firebase.database().ref('Student');
    var key;
    console.log('items', items);
    await items.on('value', (datasnap) => {
      console.log('datasnap', datasnap);
      this.setState({students: [datasnap]});
      console.log('object', Object.keys(datasnap.val()));
      if (datasnap != null) {
        key = Object.values(datasnap.val());
        console.log('key.index', key);
      }
    });
    db.transaction((txn) => {
      for (let i = 0; i < key.length; ++i)
        txn.executeSql(
          'INSERT INTO Students (s_id,name,contact,adrs) VALUES (null,?,?,?)',
          [key[i].name, key[i].contact, key[i].adrs],
          (tx, res) => {
            console.log('Row Inserted', res);
            this.setState({students: res});
            if (res.rowsAffected == 0) {
              console.log('not inserted');
            } else {
              console.log('data inserted');
            }
          },
        );
    });

    console.log('items', items);
  }
  DelFromDataBase() {
    db.transaction((txn) => {
      txn.executeSql('Delete From Students', [], (tx, res) => {
        if (res.rowsAffected == 0) {
          console.log('Not Deleted');
        } else {
          console.log('data Deleted');
        }
      });
    });
  }

  StoreToFirebase() {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM Students', [], (tx, results) => {
        console.log('Query completed', results.rows);
        let items = firebase.database().ref('Student');
        for (let i = 0; i < results.rows.length; ++i)
          items.push({
            name: results.rows.item(i).name,
            adrs: results.rows.item(i).adrs,
            contact: results.rows.item(i).contact,
          });
      });
    });
  }
  renderItem(item) {
    if (item) {
      return (
        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.text}>Name : {item.item.name}</Text>
            <Text style={styles.text}>Address : {item.item.adrs}</Text>
            <Text style={styles.text}>Phone : {item.item.contact}</Text>
          </View>
        </ScrollView>
      );
    }
  }
  async FirebaseToSqlite() {
    const items = firebase.database().ref('Student');
    var key;
    await items.on('value', (datasnap) => {
      // console.log('datasnap', datasnap)
      // this.setState({students:[datasnap]})
      // console.log('object', Object.keys(datasnap.val()))
      key = Object.values(datasnap.val());
      console.log('key.index', key);
    });
    db.transaction((txn) => {
      for (let i = 0; i < key.length; ++i)
        txn.executeSql(
          'INSERT INTO Students (s_id,name,contact,adrs) VALUES (null,?,?,?)',
          [key[i].name, key[i].contact, key[i].adrs],
          (tx, res) => {
            console.log('Row Inserted', res);
            this.setState({students: res});
            if (res.rowsAffected == 0) {
              console.log('not inserted');
            } else {
              console.log('data inserted');
            }
          },
        );
    });
  }

  delDataFirebase() {
    const items = firebase.database().ref('Student/');
    items.remove();
  }
  render() {
    return (
      <>
        <TextInput
          placeholder="Enter name"
          onChangeText={(text) => this.onChangeTextFun(text, 'name')}
        />
        <TextInput
          placeholder="Enter Number"
          onChangeText={(text) => this.onChangeTextFun(text, 'num')}
        />
        <TextInput
          placeholder="Enter Address"
          onChangeText={(text) => this.onChangeTextFun(text, 'adrs')}
        />
        <TouchableOpacity onPress={() => this.AddToDatabase()}>
          <Text>Add to local database</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.GetData()}>
          <Text>Get Data</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.DelFromDataBase()}>
          <Text>Clear 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.StoreToFirebase()}>
          <Text>Sync 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.FirebaseToSqlite()}>
          <Text>Sync 2(Add data from firebase to sqlite )</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.delDataFirebase()}>
          <Text>clear 2(delete data from firebase )</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.getDatafromFirebase()}>
          <Text>Get data from firebase</Text>
        </TouchableOpacity>
        <FlatList
          data={this.state.students}
          renderItem={(item) => this.renderItem(item)}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    width: windowWidth - 10,
    marginHorizontal: 5,
    borderColor: 'blue',
    borderWidth: 1.5,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#000',
    padding: 5,
  },
  text: {
    fontSize: 15,
    color: '#fff',
  },
});
