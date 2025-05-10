import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash } from 'react-bootstrap-icons';

const BundleCard = ({
  bundle,
  variant = 'large',
  onClick,
  isClicked,
  showActions = true,
  onDelete // Added onDelete prop
}) => {
  const sizeStyles = {
    large: {
      headerClass: 'py-2 bg-dark text-white',
      titleClass: 'h5 mb-0',
      bodyClass: '',
      textClass: 'small'
    },
    small: {
      headerClass: 'py-1 bg-dark text-white',
      titleClass: 'h6 mb-0',
      bodyClass: 'py-1',
      textClass: 'small mb-1'
    }
  };

  const { headerClass, titleClass, bodyClass, textClass } = sizeStyles[variant];

  return (
    <Card
      className={`h-100 shadow-sm ${isClicked ? 'click-animation' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: isClicked ? '2px solid var(--bs-primary)' : '',
        transform: isClicked ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      <Card.Header className={`d-flex justify-content-between align-items-center ${headerClass}`}>
        <span className={titleClass}>{bundle.name}</span>
        <Badge bg={bundle.type === 'prepaid' ? 'success' : 'primary'}>
          {bundle.type}
        </Badge>
      </Card.Header>

      <Card.Body className={bodyClass}>
        <Card.Text className={`text-muted ${textClass}`}>
          {bundle.description}
        </Card.Text>

        <div className={textClass}>
          <div className="d-flex justify-content-between">
            <span>Price:</span>
            <strong>${bundle.price}/mo</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span>Data Cap:</span>
            <strong>{bundle.dataCap === 0 ? 'unlimited' : `${bundle.dataCap}GB`}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span>Speed:</span>
            <strong>{bundle.speed}Mbps</strong>
          </div>
        </div>
      </Card.Body>

      {showActions && variant === 'large' && (
        <Card.Footer className="d-flex justify-content-end gap-2">
          {/* <Button variant="info" size="sm">View</Button> */}
          <Button
            variant="warning"
            size="sm"
            as={Link}
            to={`/bundles/edit/${bundle.id || bundle.bundleId}`}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete} // Call onDelete prop when clicked
          >
            <Trash size={16} /> Delete
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default BundleCard;