import { Dropdown, Form } from 'react-bootstrap';

export const MultiSelectDropdown = ({
  options = [],
  selected = [],
  onToggle,
  label = 'Select',
  variant = 'outline-primary',
  isOpen,
  onToggleDropdown,
  dropdownKey
}) => {
  return (
    <Dropdown show={isOpen} onToggle={() => onToggleDropdown(dropdownKey)}>
      <Dropdown.Toggle variant={variant} className="me-2">
        {label} {selected.length > 0 && `(${selected.length})`}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '250px',
        padding: '0.5rem 1rem',
      }}>
        {options.length > 0 ? options.map((option, index) => (
          <Form.Check
            key={`${dropdownKey}-option-${index}`}
            type="checkbox"
            id={`checkbox-${dropdownKey}-${option.toString().replace(/\s+/g, '-')}`}
            label={option}
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className="py-1"
          />
        )) : (
          <Dropdown.ItemText className="text-muted">No options available</Dropdown.ItemText>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};