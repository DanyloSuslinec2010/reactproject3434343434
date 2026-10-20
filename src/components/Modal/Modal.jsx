import { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

// Класовий компонент: слухаємо Escape в componentDidMount, прибираємо в componentWillUnmount
class Modal extends Component {
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = 'hidden';
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
  }

  handleKeyDown = e => {
    if (e.code === 'Escape') {
      this.props.onClose();
    }
  };

  handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <div className={styles.backdrop} onClick={this.handleBackdropClick}>
        <div className={styles.modal}>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрити"
            onClick={this.props.onClose}
          >
            ×
          </button>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default Modal;
