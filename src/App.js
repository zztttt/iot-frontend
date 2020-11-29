import logo from './logo.svg';
import './App.css';
import React from "react";


//import EchartsTest from './components/echartTest'
import BarChart from './components/barChart'
//import dynamicChart from './components/dynamicChart'
import Dynamic from "./components/Dynamic";

function App() {
  return (
    <div className="App">
      <BarChart/>
      <Dynamic/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
