// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const toggleApiKeyBtn = document.getElementById('toggle-api-key');
const validateKeyBtn = document.getElementById('validate-key');
const authStatus = document.getElementById('auth-status');
const actorSection = document.getElementById('actor-section');
const actorSelect = document.getElementById('actor-select');
const actorInfo = document.getElementById('actor-info');
const actorName = document.getElementById('actor-name').querySelector('span');
const actorDescription = document.getElementById('actor-description');
const inputSection = document.getElementById('input-section');
const inputSchemaForm = document.getElementById('input-schema-form');
const runActorBtn = document.getElementById('run-actor');
const resultsSection = document.getElementById('results-section');
const resultsLoader = document.getElementById('results-loader');
const runStatus = document.getElementById('run-status');
const resultsJson = document.getElementById('results-json');
const copyResultsBtn = document.getElementById('copy-results');

// State
let apiKey = '';
let selectedActor = null;
let actorInputSchema = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', setupEventListeners);

function setupEventListeners() {
  validateKeyBtn.addEventListener('click', validateApiKey);
  actorSelect.addEventListener('change', handleActorSelection);
  runActorBtn.addEventListener('click', runSelectedActor);
  copyResultsBtn.addEventListener('click', copyResultsToClipboard);
  
  // Add toggle functionality for API key visibility
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  
  // Add enter key support for API key input
  apiKeyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      validateApiKey();
    }
  });
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
  const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
  apiKeyInput.setAttribute('type', type);
  
  // Toggle icon
  const icon = toggleApiKeyBtn.querySelector('i');
  if (type === 'password') {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  } else {
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  }
}

// Copy results to clipboard
function copyResultsToClipboard() {
  const textToCopy = resultsJson.textContent;
  
  if (!textToCopy) {
    return;
  }
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Show temporary success message
      const originalText = copyResultsBtn.innerHTML;
      copyResultsBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      
      setTimeout(() => {
        copyResultsBtn.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}

// API Key Validation
async function validateApiKey() {
  const key = apiKeyInput.value.trim();
  
  if (!key) {
    showAuthError('Please enter an API key');
    return;
  }
  
  try {
    showAuthStatus('Validating API key...', 'status-message');
    
    const response = await fetch('/api/validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey: key })
    });
    
    const data = await response.json();
    
    if (data.valid) {
      apiKey = key;
      showAuthSuccess(`API key validated successfully. Welcome, ${data.user.data.username || 'User'}!`);
      fetchActors();
    } else {
      showAuthError('Invalid API key. Please check and try again.');
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    showAuthError('Error validating API key. Please try again.');
  }
}

function showAuthStatus(message, className) {
  authStatus.textContent = message;
  authStatus.className = className;
  authStatus.classList.remove('hidden');
}

function showAuthSuccess(message) {
  showAuthStatus(message, 'status-message status-success');
  actorSection.classList.remove('hidden');
}

function showAuthError(message) {
  showAuthStatus(message, 'status-message status-error');
  actorSection.classList.add('hidden');
  inputSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
}

// Fetch Actors
async function fetchActors() {
  try {
    const response = await fetch(`/api/actors?apiKey=${encodeURIComponent(apiKey)}`);
    const data = await response.json();
    
    if (data.data && data.data.items) {
      populateActorSelect(data.data.items);
    } else {
      showAuthError('Failed to fetch actors. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching actors:', error);
    showAuthError('Error fetching actors. Please try again.');
  }
}

function populateActorSelect(actors) {
  // Clear existing options except the first one
  while (actorSelect.options.length > 1) {
    actorSelect.remove(1);
  }
  
  // Add actors to select dropdown
  actors.forEach(actor => {
    const option = document.createElement('option');
    option.value = actor.id;
    option.textContent = actor.name;
    actorSelect.appendChild(option);
  });
}

// Handle Actor Selection
async function handleActorSelection() {
  const actorId = actorSelect.value;
  
  if (!actorId) {
    actorInfo.classList.add('hidden');
    inputSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    return;
  }
  
  try {
    const response = await fetch(`/api/actors/${actorId}?apiKey=${encodeURIComponent(apiKey)}`);
    const data = await response.json();
    
    if (data.data) {
      selectedActor = data.data;
      displayActorInfo(selectedActor);
      
      if (selectedActor.input) {
        actorInputSchema = selectedActor.input;
        renderInputSchemaForm(actorInputSchema);
        inputSection.classList.remove('hidden');
      } else {
        inputSection.classList.add('hidden');
      }
    } else {
      actorInfo.classList.add('hidden');
      inputSection.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error fetching actor details:', error);
    actorInfo.classList.add('hidden');
    inputSection.classList.add('hidden');
  }
}

function displayActorInfo(actor) {
  actorName.textContent = actor.name;
  actorDescription.textContent = actor.description || 'No description available';
  actorInfo.classList.remove('hidden');
}

// Render Input Schema Form
function renderInputSchemaForm(schema) {
  // Clear existing form
  inputSchemaForm.innerHTML = '';
  
  if (!schema || !schema.properties) {
    inputSchemaForm.innerHTML = '<p>This actor does not have an input schema.</p>';
    return;
  }
  
  // Create form fields based on schema properties
  Object.entries(schema.properties).forEach(([key, property]) => {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'schema-field';
    
    // Field title
    const fieldTitle = document.createElement('div');
    fieldTitle.className = 'schema-field-title';
    fieldTitle.textContent = property.title || key;
    
    // Field description
    const fieldDescription = document.createElement('div');
    fieldDescription.className = 'schema-field-description';
    fieldDescription.textContent = property.description || '';
    
    // Field input
    let fieldInput;
    
    switch (property.type) {
      case 'string':
        if (property.enum) {
          // Dropdown for enum values
          fieldInput = document.createElement('select');
          fieldInput.id = `input-${key}`;
          fieldInput.name = key;
          
          // Add empty option
          const emptyOption = document.createElement('option');
          emptyOption.value = '';
          emptyOption.textContent = '-- Select an option --';
          fieldInput.appendChild(emptyOption);
          
          // Add enum options
          property.enum.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            fieldInput.appendChild(option);
          });
        } else {
          // Text input for regular strings
          fieldInput = document.createElement('input');
          fieldInput.type = 'text';
          fieldInput.id = `input-${key}`;
          fieldInput.name = key;
          fieldInput.placeholder = property.example || '';
        }
        break;
      
      case 'boolean':
        // Checkbox for boolean values
        fieldInput = document.createElement('input');
        fieldInput.type = 'checkbox';
        fieldInput.id = `input-${key}`;
        fieldInput.name = key;
        break;
      
      case 'integer':
      case 'number':
        // Number input for numeric values
        fieldInput = document.createElement('input');
        fieldInput.type = 'number';
        fieldInput.id = `input-${key}`;
        fieldInput.name = key;
        fieldInput.placeholder = property.example || '';
        
        if (property.minimum !== undefined) {
          fieldInput.min = property.minimum;
        }
        
        if (property.maximum !== undefined) {
          fieldInput.max = property.maximum;
        }
        break;
      
      case 'array':
        // Textarea for arrays (JSON input)
        fieldInput = document.createElement('textarea');
        fieldInput.id = `input-${key}`;
        fieldInput.name = key;
        fieldInput.placeholder = 'Enter JSON array';
        fieldInput.rows = 4;
        break;
      
      case 'object':
        // Textarea for objects (JSON input)
        fieldInput = document.createElement('textarea');
        fieldInput.id = `input-${key}`;
        fieldInput.name = key;
        fieldInput.placeholder = 'Enter JSON object';
        fieldInput.rows = 4;
        break;
      
      default:
        // Default to text input
        fieldInput = document.createElement('input');
        fieldInput.type = 'text';
        fieldInput.id = `input-${key}`;
        fieldInput.name = key;
        break;
    }
    
    // Add required attribute if needed
    if (schema.required && schema.required.includes(key)) {
      fieldInput.required = true;
      fieldTitle.textContent += ' *';
    }
    
    // Append elements to container
    fieldContainer.appendChild(fieldTitle);
    fieldContainer.appendChild(fieldDescription);
    fieldContainer.appendChild(fieldInput);
    
    // Append container to form
    inputSchemaForm.appendChild(fieldContainer);
  });
}

// Run Selected Actor
async function runSelectedActor() {
  if (!selectedActor) {
    alert('Please select an actor first');
    return;
  }
  
  // Collect input values from form
  const input = {};
  const formFields = inputSchemaForm.querySelectorAll('input, select, textarea');
  
  formFields.forEach(field => {
    const key = field.name;
    let value;
    
    if (field.type === 'checkbox') {
      value = field.checked;
    } else if (field.tagName === 'TEXTAREA' && (key in actorInputSchema.properties) && 
              (actorInputSchema.properties[key].type === 'object' || 
               actorInputSchema.properties[key].type === 'array')) {
      try {
        // Parse JSON for object and array types
        value = field.value ? JSON.parse(field.value) : null;
      } catch (error) {
        alert(`Invalid JSON in field ${key}. Please check your input.`);
        return;
      }
    } else {
      value = field.value;
    }
    
    // Only include non-empty values
    if (value !== '' && value !== null && value !== undefined) {
      input[key] = value;
    }
  });
  
  // Show loader and results section
  resultsSection.classList.remove('hidden');
  resultsLoader.classList.remove('hidden');
  runStatus.textContent = 'Running actor...';
  runStatus.className = 'status-message';
  resultsJson.textContent = '';
  
  try {
    const response = await fetch(`/api/actors/${selectedActor.id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey,
        input
      })
    });
    
    const data = await response.json();
    
    // Hide loader
    resultsLoader.classList.add('hidden');
    
    if (data.error) {
      runStatus.textContent = `Error: ${data.error}`;
      runStatus.className = 'status-message status-error';
    } else {
      runStatus.textContent = 'Actor run completed successfully!';
      runStatus.className = 'status-message status-success';
      
      // Display results
      resultsJson.textContent = JSON.stringify(data.result, null, 2);
    }
  } catch (error) {
    console.error('Error running actor:', error);
    resultsLoader.classList.add('hidden');
    runStatus.textContent = 'Error running actor. Please try again.';
    runStatus.className = 'status-message status-error';
  }
}