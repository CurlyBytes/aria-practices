/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   menu-button-links.js
*
*   Desc:   Creates a menu button that opens a menu of links
*/

var MenuButtonLinks = function (domNode) {

  this.domNode       = domNode;
  this.buttonNode    = domNode.querySelector('button');
  this.menuNode      = domNode.querySelector('[role="menu"]');
  this.menuitemNodes = []
  this.firstMenuitem = false;
  this.lastMenuitem  = false;
  this.firstChars = [];

  this.buttonNode.addEventListener('keydown', this.handleButtonKeydown.bind(this));
  this.buttonNode.addEventListener('click', this.handleButtonClick.bind(this));

  var nodes = domNode.querySelectorAll('[role="menuitem"]');

  for (var i = 0; i < nodes.length; i++) {
    var menuitem = nodes[i];
    this.menuitemNodes.push(menuitem);
    menuitem.tabIndex = -1;
    this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

    menuitem.addEventListener('keydown', this.handleMenuitemKeydown.bind(this));

    menuitem.addEventListener('mouseover', this.handleMenuitemMouseover.bind(this));

    if( !this.firstMenuitem) {
      this.firstMenuitem = menuitem;
    }
    this.lastMenuitem = menuitem;
  }

  domNode.addEventListener('focusin', this.handleFocusin.bind(this));
  domNode.addEventListener('focusout', this.handleFocusout.bind(this));

  window.addEventListener('mousedown', this.handleBackgroundMousedown.bind(this), true);
};

MenuButtonLinks.prototype.setFocusToMenuitem = function (newMenuitem) {
  this.menuitemNodes.forEach(function(item) {
    if (item === newMenuitem) {
      item.tabIndex = 0;
      newMenuitem.focus();
    }
    else {
      item.tabIndex = -1;
    }
  });
};

MenuButtonLinks.prototype.setFocusToFirstMenuitem = function (currentMenuitem) {
  this.setFocusToMenuitem(this.firstMenuitem);
};

MenuButtonLinks.prototype.setFocusToLastMenuitem = function (currentMenuitem) {
  this.setFocusToMenuitem(this.lastMenuitem);
};

MenuButtonLinks.prototype.setFocusToPreviousMenuitem = function (currentMenuitem) {
  var newMenuitem, index;

  if (currentMenuitem === this.firstMenuitem) {
    newMenuitem = this.lastMenuitem;
  }
  else {
    index = this.menuitemNodes.indexOf(currentMenuitem);
    newMenuitem = this.menuitemNodes[ index - 1 ];
  }

  this.setFocusToMenuitem(newMenuitem);

  return newMenuitem;
};

MenuButtonLinks.prototype.setFocusToNextMenuitem = function (currentMenuitem) {
  var newMenuitem, index;

  if (currentMenuitem === this.lastMenuitem) {
    newMenuitem = this.firstMenuitem;
  }
  else {
    index = this.menuitemNodes.indexOf(currentMenuitem);
    newMenuitem = this.menuitemNodes[ index + 1 ];
  }
  this.setFocusToMenuitem(newMenuitem);

  return newMenuitem;
};

MenuButtonLinks.prototype.setFocusByFirstCharacter = function (currentMenuitem, char) {
  var start, index;

  if (char.length > 1) {
    return;
  }

  char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.menuitemNodes.indexOf(currentMenuitem) + 1;
  if (start >=  this.menuitemNodes.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.firstChars.indexOf(char, start);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.firstChars.indexOf(char, 0);
  }

  // If match was found...
  if (index > -1) {
    this.setFocusToMenuitem(this.menuitemNodes[index]);
  }
};

// Utilities

MenuButtonLinks.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[i]) {
      return i;
    }
  }
  return -1;
};

// Popup menu methods

MenuButtonLinks.prototype.openPopup = function () {
  var rect = this.menuNode.getBoundingClientRect();
  this.menuNode.style.display = 'block';
  this.buttonNode.setAttribute('aria-expanded', 'true');
};

MenuButtonLinks.prototype.closePopup = function () {
  if (this.isOpen()) {
    this.buttonNode.setAttribute('aria-expanded', 'false');
    this.menuNode.style.display = 'none';
  }
};

MenuButtonLinks.prototype.isOpen = function () {
  return this.buttonNode.getAttribute('aria-expanded') === 'true';
};

// Menu event handlers

MenuButtonLinks.prototype.handleFocusin = function (event) {
  this.domNode.classList.add('focus');
};

MenuButtonLinks.prototype.handleFocusout = function (event) {
  this.domNode.classList.remove('focus');
};

MenuButtonLinks.prototype.handleButtonKeydown = function (event) {
  var tgt = event.currentTarget,
    key = event.key,
    flag = false;

  switch (key) {
    case ' ':
    case 'Enter':
    case 'ArrowDown':
    case 'Down':
      this.openPopup();
      this.setFocusToFirstMenuitem();
      flag = true;
     break;

    case 'Esc':
    case 'Escape':
        this.closePopup();
        this.buttonNode.focus();
        flag = true;
      break;

    case 'Up':
    case 'ArrowUp':
      this.openPopup();
      this.setFocusToLastMenuitem();
      flag = true;
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

MenuButtonLinks.prototype.handleButtonClick = function (event) {
  if (this.isOpen()) {
    this.closePopup();
    this.buttonNode.focus();
  }
  else {
    this.openPopup();
    this.setFocusToFirstMenuitem();
  }

  event.stopPropagation();
  event.preventDefault();
};

MenuButtonLinks.prototype.handleMenuitemKeydown = function (event) {
  var tgt = event.currentTarget,
    key = event.key,
    flag = false;

  function isPrintableCharacter (str) {
    return str.length === 1 && str.match(/\S/);
  }

  if (event.ctrlKey || event.altKey  || event.metaKey) {
    return;
  }

  if (event.shiftKey) {
    if (isPrintableCharacter(key)) {
      this.setFocusByFirstCharacter(tgt, key);
      flag = true;
    }

    if (event.key === 'Tab') {
      this.buttonNode.focus();
      this.closePopup();
      flag = true;
    }
  }
  else {

    switch (key) {
      case ' ':
       window.location.href=tgt.href;
       break;

      case 'Esc':
      case 'Escape':
        this.closePopup();
        this.buttonNode.focus();
        flag = true;
        break;

      case 'Up':
      case 'ArrowUp':
        this.setFocusToPreviousMenuitem(tgt);
        flag = true;
        break;

      case 'ArrowDown':
      case 'Down':
        this.setFocusToNextMenuitem(tgt);
        flag = true;
        break;

      case 'Home':
      case 'PageUp':
        this.setFocusToFirstMenuitem();
        flag = true;
        break;

      case 'End':
      case 'PageDown':
        this.setFocusToLastMenuitem();
        flag = true;
        break;

      case 'Tab':
        this.closePopup();
        break;

      default:
        if (isPrintableCharacter(key)) {
          this.setFocusByFirstCharacter(tgt, key);
          flag = true;
        }
        break;
    }

  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

MenuButtonLinks.prototype.handleMenuitemMouseover = function (event) {
  var tgt = event.currentTarget;
  tgt.focus();
};

MenuButtonLinks.prototype.handleBackgroundMousedown = function (event) {
  if (!this.domNode.contains(event.target)) {
    if (this.isOpen()) {
      this.closePopup();
      this.buttonNode.focus();
    }
  }
};

// Initialize menu buttons

window.addEventListener('load', function () {
  var menuButtons = document.querySelectorAll('.menu-button-links');
  for(var i=0; i < menuButtons.length; i++) {
    var menuButton = new MenuButtonLinks(menuButtons[i]);
  }
});
