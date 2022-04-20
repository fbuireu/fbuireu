## What is Redux? Do I need to use it?

*Before we start: This is a short introduction to Redux that I wrote after I was asked about it by one of my mentees. If you've never used it and are wondering whether it's for you, you're in the right place. If you're a senior developer who worked with Redux before and need an in-depth guide, you may find this post isn't what you're looking for. *

-------

## What is Redux?
From the  [official documentation](https://redux.js.org/) :

>Redux is a predictable state container designed to help you write JavaScript apps that behave consistently across client, server, and native environments and are easy to test. While it's mostly used as a state management tool with React, you can use it with any other JavaScript framework or library.

Ok, slow down, what does that mean?

To summarize, **Redux is a global state manager for React applications**, made, among others, by the great [Dan Abramov](https://twitter.com/dan_abramov) in 2015, that inherits its pattern from [Flux](https://facebook.github.io/flux/docs/in-depth-overview/). So **Redux is the React-based interpretation of Flux**, which at the same time is a **variation of the MVC** (Model-View-Controller) pattern.

Having global state management (called **store**) in React applications can be handy and useful if you think of a complex project where there are a lot of use-cases to manage. Some may think that it could be dangerous since you have a unique store to manipulate that state but Uncle Ben was right:

![Uncle Ben's quote](https://cdn.hashnode.com/res/hashnode/image/upload/v1631458468095/TeTXqru8S.gif)

That's why Redux adds the concept of **immutability** and **read-only states**. So, our views can only read the state from the store but to change it, we'll need to dispatch actions. 

An **action is just a JavaScript object** which contains a `type` attribute and, if needed, the data as a payload. For example, a typical action may look like this:


```
{
   type: 'LOAD_PRODUCTS',
   products: products
}
``` 
Which can be returned in a function (action creator) call such as:


```
function loadProducts(products) {
  return {
    type: "LOAD_PRODUCTS",
    products,
  };
}
``` 

To specify how we are going to change the state tree, we are going to use **reducers** which in the end, are just **pure functions** (a function which given the same input data returns the same result). A dummy pure function may look like this:

```
function sum(a, b) {
  return a + b;
}
```
This function, given the same parameters, will always return the same result. If we call `sum(1,2)` it will always return `3` so it will be easy to debug and find potential issues, hence easier to test.

Back to Redux again: a **reducer is just a function that gets 2 parameters** (the initial state and action) and depending on that action, it will trigger one operation on another in the state. It will always keep the immutability of the state. We will never be able to modify the state, only create copies based on the previous one. 

A reducer looks like this:

```
function reducer (state, action) {
   switch(action.type) {
     case 'ADD_ITEM':
       return state.concat(action.item);
     case 'REMOVE_ITEM':
     ...
     default:
       return state;
   }
}
```
In the snippet above, I'm assuming I'm sending an `item` inside the `action`'s payload to concatenate to the global state.

Because of that workflow, race conditions where, for example, components are trying to manipulate the state, are avoided, **minimizing side-effects**.

The UI can be subscribed to these state changes so it will be notified to **refresh it accordingly**.

All this bunch of nonsense can be summarized in the following picture:
![Redux state sample](https://cdn.hashnode.com/res/hashnode/image/upload/v1631460004182/yiok5VmFo.png)

The reduction of the complexity and side-effects, unwanted renderings, and changes of state is evident. 

--------

*Off-topic: you may have heard about [Redux-Saga](https://redux-saga.js.org/). It's just a middleware that is used to interact asynchronously with resources outside the scope of the application, including HTTP requests to external services, accessing browser storage, etc.*

-------

Complicating a little bit the overall map, in a more realistic scenario:
![Redux workflow](https://cdn.hashnode.com/res/hashnode/image/upload/v1631509362129/KexmYze3a.gif)

We have now the final picture of Redux:
- The UI send events to our actions (button clicks, the asynchronous fetch of data, etc)
- The store receives actions and passes them to our reducers (pure functions) to generate a new state based on the previous one. The store's state is immutable so any modification will generate a new state
- The store will notify this change to the subscribers 
- The UI refreshes taking the store state as an input value
- If any, asynchronous calls get into the workflow producing the same behavior

# What are the benefits of Redux?
You may be asking (if your brain hasn't melted yet) what benefits are added by this overkilling way of structuring React apps.

- Deterministic UI: because we use pure functions everywhere, our output will be always deterministic, which means that we will always generate the same predictable output given the same input, adding solidity to our apps
- Logging: we've commented that we change the state through actions that are pure JavaScript objects, which means that we can at any moment re-create the state from scratch if we keep a log of those actions, so time-traveling will be a walk in the park. This also adds the option of logging every action 
- Debuggability: because of what's explained in the previous step, we can detect the exact modifications of the state
- Easy to test: unit tests are so easy to apply because we are testing pure functions for UI and state mutation
- Vast developer helping tools:  [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) allows you to stack-trace everything explained in this article
- State persistence: you can persist some of the app’s state to local storage and restore it after a refresh. This can be really nifty
- Last but not least, **segregation of responsibilities**: personally, I think the most important benefit, among the ones commented before, is the segregation of responsibilities and the uncoupling of the pieces of our app. The **UI is agnostic to the data** and doesn't need to know how and when the data is treated, it's only responsible for printing the data that it gets. While on the other side, we have a piece that controls how the data is treated and makes the asynchronous requests (if any) to fetch the data. Keeping this segregation is important to keep the scalability, maintainability, and reusability of the project. In this way, we aren't attached to React or any other framework. If we (or our team) decide to change the framework, we will only need to decouple small pieces and redo them rather than the whole app.

# The final question: do I need Redux?
It may seem that Redux is cool as, but you always need to ask yourself: do you need it? Is it worth adding this kind of complexity in all React-based projects?

The answer is simple: **no**.

**It's always interesting and a good idea to apply design patterns** (like Flux) that fit your project/technology requirements to prioritize the scalability of the project, but **using Redux in 2021 isn't always a good option**.

Keep in mind that for small projects, like personal blogs, using Redux could be an extremely overkilling option. **You may not need it**.

What happens in other cases? Even if you have a big project you still don't need to bend over backward to use it.

Even [Dan Abramov in one of his articles](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) wonders about its utility:


> If you feel pressured to do things "the Redux way", it may be a sign that you or your teammates are taking it too seriously.

**You can apply the Redux approach without using Redux**, using local state instead. A simple component like:

```
import React, { Component } from 'react';

class Counter extends Component {
  state = { value: 0 };

  increment = () => {
    this.setState(prevState => ({
      value: prevState.value + 1
    }));
  };

  decrement = () => {
    this.setState(prevState => ({
      value: prevState.value - 1
    }));
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
```
Can be refactored into a "Redux way" as:

```
import React, { Component } from 'react';

const counter = (state = { value: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { value: state.value + 1 };
    case 'DECREMENT':
      return { value: state.value - 1 };
    default:
      return state;
  }
}

class Counter extends Component {
  state = counter(undefined, {});
  
  dispatch(action) {
    this.setState(prevState => counter(prevState, action));
  }

  increment = () => {
    this.dispatch({ type: 'INCREMENT' });
  };

  decrement = () => {
    this.dispatch({ type: 'DECREMENT' });
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
```
The `reducer` has been extracted into an isolate component, creating a kind of **subscriber** (another interesting design pattern) without using the Redux library.

Should you do this to your stateful components? **Probably not**. That is, not unless you have a plan to benefit from this additional indirection. 

# Redux: Conclusion
Redux library itself is only a set of helpers to "mount" reducers to create a single global store object. You can use as little or as much Redux as you like, you don't have to apply it to your whole project.

If you use Redux to develop your application, even small changes in functionality may require you to write excessive amounts of code. This goes against the **direct-mapping principle**, which states that small functional changes should result in small code changes.

Applications that consist of mostly **simple UI changes most often don’t require a complicated pattern like Redux**. Sometimes, old-fashioned state sharing between different components works as well and improves the maintainability of your code.

Also, you can avoid using Redux if your **data comes from a single data source** per view. In other words, if you don’t require data from multiple sources, there’s no need to introduce Redux. Why? **You won’t run into data inconsistency problems when accessing a single data source per view**.

Therefore, make sure to check if you need Redux before introducing its complexity, **think about the goal and the future scalability of your project**. 

Although it’s a reasonably efficient pattern that promotes pure functions, **it might be an overhead for simple applications that involve only a couple of UI changes**. On top of that, don’t forget that Redux is an in-memory state store. In other words, if your application crashes, you lose your entire application state. This means that you have to use a caching solution to create a backup of your application state, which again creates extra overhead.

As with everything in programming, **adapt the technology to your needs, not otherwise**. Use Redux if it fits, use React if it fits, use Angular if it fits. That's my saying but it could be Uncle Ben's.

