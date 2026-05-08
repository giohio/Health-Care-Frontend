import '@testing-library/jest-dom'
import React from 'react'
// Make React globally available for components that rely on the classic JSX transform
// (needed when @vitejs/plugin-react v6 JSX auto-runtime isn't applied in the test environment)
globalThis.React = React

// scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = function() {}
