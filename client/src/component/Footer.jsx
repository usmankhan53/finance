import React from 'react';
import './Footer.css';

function Footer() {
  return (
<footer className="footer-category">
    <div className="text-center p-3">
      &copy; {new Date().getFullYear()} Developed and Managed By{' '}
      <a className="text-white" href="https://techxudo.com/">
        techxudo.com
      </a>
    </div>
  </footer>
  )
}

export default Footer