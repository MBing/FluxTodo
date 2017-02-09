/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import KeyMirror from 'key-mirror';
import { EventEmitter } from 'events';
import { Dispatcher } from 'flux';

import {
  AppRegistry,
  StyleSheet,
  View,
  ListView,
} from 'react-native';

const AppDispatcher = new Dispatcher();
const TodoConstants = KeyMirror({
  TODO_CREATE: null,
  TODO_COMPLETE: null,
  TODO_DESTROY: null,
  TODO_UNDO_COMPLETE: null,
});

let TodoActions = {
  create: text => {
    AppDispatcher.dispatch({
      actionType: TodoConstants.TODO_CREATE,
      id: id,
    });
  },
  toggleComplete: todo => {
    let id = todo.id;
    if (todo.complete) {
      AppDispatcher.dispatch({
        actionType: TodoConstants.TODO_UNDO_COMPLETE,
        id: id,
      });
    } else {
      AppDispatcher.dispatch({
        actionType: TodoConstants.TODO_COMPLETE
      });
    }
  },
  destroy: id => {
    AppDispatcher.dispatch({
      actionType: TodoConstants.TODO_DESTROY,
      id: id,
    });
  },
};

const CHANGE_EVENT = 'change';

let _todos = {};

function create(text) {
  let id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _todos[id] = {
    id: id,
    complete: false,
    text: text,
  };
}

function update(id, updates) {
  _todos[id] = assign({}, _todos[id], updates);
}

function destroy(id) {
  delete _todos[id];
}

let TodoStore = Object.assign({}, EventEmitter.prototype, {
  getAll: () => _todos.slice(),
  emitChange: () => this.emit(CHANGE_EVENT),
  addChangeListener: callback => this.on(CHANGE_EVENT, callback),
  removeChangeListener: callback => this.removeListener(CHANGE_EVENT, callback),
});

AppDispatcher.register(action => {
  let text;
  switch(action.actionType) {
    case TodoConstants.TODO_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text);
        TodoStore.emitChange();
      }
      break;
    case TodoConstants.TODO_UNDO_COMPLETE:
      update(action.id, {complete: false});
      TodoStore.emitChange();
      break;
    case TodoConstants.TODO_DESTROY:
      destroy(action.id);
      TodoStore.emitChange();
      break;
    default;
  }
});

export default class MainSection extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ListView dataSource={this.props.todos} renderRow={this.renderItem} />
      </View>
    );
  }
}

MainSection.PropTypes = {
  todos: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('FluxTodo', () => FluxTodo);
