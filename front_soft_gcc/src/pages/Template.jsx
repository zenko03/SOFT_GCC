import React from 'react';
import NavigationBar from '../components/NavigationBar';
import MenuBar from '../components/MenuBar';
import Body from '../components/Body';
import Footer from '../components/Footer';

function Template() {
  return (
    <div>
      <NavigationBar />
      <div class="container-fluid page-body-wrapper">
        <MenuBar />
        <div class="main-panel">
            <Body />
            <Footer />
        </div>
      </div>
    </div>
  );
}

export default Template;
