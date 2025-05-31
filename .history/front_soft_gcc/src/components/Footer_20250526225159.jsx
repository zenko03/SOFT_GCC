import React from 'react';

// Contenu du pied de page
function Footer({ task }) {
  return (
    <footer className="footer">
        <div className="footer-inner-wraper">
            <div className="d-sm-flex justify-content-center justify-content-sm-between">
                <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">Copyright © Softwell.mg 2025</span>
            </div>
        </div>
    </footer>
  );
}

export default Footer;
