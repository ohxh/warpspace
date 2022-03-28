import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { AppSettingsProvider } from './components/new/Settings/AppSettingsContext';
import { NotesApp } from './notes/notesapp';
import "./style.css";
import "./components/new/Settings/theme.css";

ReactDOM.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <NotesApp />
    </AppSettingsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
