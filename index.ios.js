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
  Text,
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
  _todos[id] = Object.assign({}, _todos[id], updates);
}

function destroy(id) {
  delete _todos[id];
}

let TodoStore = Object.assign({}, EventEmitter.prototype, {
  getAll: () => {
    var todos = [];
    for (let key in _todos) {
      todos.push(key);
      // _todos.slice();
    }
    return todos;
  },
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
    case TodoConstants.TODO_COMPLETE:
      update(action.id, {complete: true});
      TodoStore.emitChange();
      break;
    case TodoConstants.TODO_DESTROY:
      destroy(action.id);
      TodoStore.emitChange();
      break;
    default:
  }
});

export default class FluxTodo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
    };
  }

  componentDidMount() {
    this.updateList();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.updateList();
    }
  }

  updateList() {
    console.log(this.props);
    const { todos } = this.props;

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(todos),
    });
  }

  render() {
    return (
      <View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={todo => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                    />
                )}
        />
      </View>
    );
  }
}

FluxTodo.PropTypes = {
  todos: PropTypes.object.isRequired,
};

export class TodoItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { todo } = this.props;
    let todoItemStyle;
    todoItemStyle = (todo.complete) ? styles.TodoItemDone : styles.TodoItem;
    return (
      <View style={todoItemStyle}>
        <Text style={styles.text}>{todo.text}</Text>
        <Text onPress={() => this._onToggleComplete(todo)}>[Complete]</Text>
        <Text onPress={() => this._onDestroy(todo)}>[Delete]</Text>
      </View>
    );
  }

  _onToggleComplete(todo) {
    TodoActions.toggleComplete(todo);
  }

  _onDestroy(todo) {
    TodoActions.destroy(todo.id);
  }
}

export class Header extends Component {
  render() {
    return (
      <View>
        <TodoTextInput />
      </View>
    )
  }
}

export class TodoTextInput extends Component {
  getInitialState() {
    return {
      value: '',
    };
  }

  render() {
    return (
      <View>
        <TextInput
          style={styles.TodoTextInput}
          onChangeText={text => this.setState({value: text})}
          onBlur={this._save}
          placeholder={'What needs to be done?'}
          value={this.state.value}
        />
      </View>
    )
  }

  _save() {
    let text = this.state.value;
    if (text) {
      TodoActions.create(text);
      this.setState({
        value: '',
      })
    }
  }
};

const styles = StyleSheet.create({
  TodoApp: {
    padding: 20,
    paddingTop: 40,
  },
  TodoItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 58,
  },
  TodoItemDone: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 58,
    opacity: .3,
  },
  text: {
    flex: 1,
    textAlign: 'left',
    fontSize: 16,
  },
  TodoTextInput: {
    height: 40,
    backgroundColor: '#EEEEEE',
    padding: 10,
    fontSize: 16,
  },
});

AppRegistry.registerComponent('FluxTodo', () => FluxTodo);
