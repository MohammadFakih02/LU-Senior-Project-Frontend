import { Dropdown, Form } from 'react-bootstrap';

export const MultiSelectDropdown = ({ 
  options, 
  selected, 
  onToggle, 
  label, 
  variant = 'outline-primary' 
}) => (
  <Dropdown autoClose="outside">
    <Dropdown.Toggle variant={variant} className="me-2">
      {label} {selected.length > 0 && `(${selected.length})`}
    </Dropdown.Toggle>
    <Dropdown.Menu 
      style={{ maxHeight: '300px', overflowY: 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map(option => (
        <Dropdown.ItemText 
          key={option} 
          className="px-3 py-1"
          onClick={(e) => e.preventDefault()}
        >
          <Form.Check
            label={option}
            checked={selected.includes(option)}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(option);
            }}
          />
        </Dropdown.ItemText>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);