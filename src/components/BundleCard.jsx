import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash } from 'react-bootstrap-icons';
import { useState, useRef, useEffect, useCallback } from 'react';

const BundleCard = ({
  bundle,
  variant = 'large',
  onClick,
  isClicked,
  showActions = true,
  onDelete,
  expandableDescription = false,
  descriptionMaxLines = 3,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isContentLongEnoughToTruncate, setIsContentLongEnoughToTruncate] = useState(false);
  const descriptionRef = useRef(null);

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

  const checkForOverflow = useCallback(() => {
    if (descriptionRef.current) {
      const hasOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      if (hasOverflow !== isContentLongEnoughToTruncate) {
        setIsContentLongEnoughToTruncate(hasOverflow);
      }
    }
  }, [isContentLongEnoughToTruncate]);

  useEffect(() => {
    if (expandableDescription) {
      if (!isDescriptionExpanded) {
        const timerId = setTimeout(checkForOverflow, 50);
        return () => clearTimeout(timerId);
      }
    } else {
      if (isContentLongEnoughToTruncate) {
          setIsContentLongEnoughToTruncate(false);
      }
    }
  }, [
    bundle.description,
    expandableDescription,
    descriptionMaxLines,
    variant,
    isDescriptionExpanded,
    checkForOverflow,
    isContentLongEnoughToTruncate
  ]);


  const toggleDescription = (e) => {
    e.stopPropagation();
    setIsDescriptionExpanded(prev => !prev);
  };

  const descriptionComputedStyles = {
    ...(expandableDescription && !isDescriptionExpanded && {
      display: '-webkit-box',
      WebkitLineClamp: descriptionMaxLines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    ...(expandableDescription && isDescriptionExpanded && {
        WebkitLineClamp: 'unset',
        display: 'block',
    }),
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };


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
        <Card.Text
          ref={descriptionRef}
          className={`text-muted ${textClass}`}
          style={descriptionComputedStyles}
        >
          {bundle.description}
        </Card.Text>
        {expandableDescription && isContentLongEnoughToTruncate && (
          <Button
            variant="link"
            size="sm"
            onClick={toggleDescription}
            className="p-0 mt-1 text-decoration-none"
            aria-expanded={isDescriptionExpanded}
          >
            {isDescriptionExpanded ? 'Read less' : 'Read more'}
          </Button>
        )}

        <div className={textClass} style={{ marginTop: (expandableDescription && isContentLongEnoughToTruncate) ? '0.5rem' : '0' }}>
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
          <Button
            variant="warning"
            size="sm"
            as={Link}
            to={`/bundles/edit/${bundle.id || bundle.bundleId}`}
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteClick}
          >
            <Trash size={16} /> Delete
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default BundleCard;