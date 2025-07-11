import { Modal } from 'react-bootstrap';

const WritingStylesModal = ({ isWritingStylesOpen, onHide }) => {
  return (
    <Modal show={isWritingStylesOpen} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Writing Styles</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Select your preferred writing style...</p>
      </Modal.Body>
    </Modal>
  );
};

export default WritingStylesModal;