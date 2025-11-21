/**
 * RENTACLOUD - REUSABLE COMPONENTS
 * Modern UI components for consistent design
 */

// Base Component class
class Component {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.state = {};
    this.events = {};
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render() {
    // Override in subclasses
  }
  
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Remove event listeners
    Object.values(this.events).forEach(handler => {
      document.removeEventListener('click', handler);
    });
  }
}

// Loading Skeleton Component
class SkeletonLoader {
  static create(type = 'text', count = 1) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type}`;
      skeletons.push(skeleton);
    }
    
    return count === 1 ? skeletons[0] : skeletons;
  }
  
  static createCard() {
    return window.utils.createElement('div', {
      className: 'card'
    }, 
      this.create('card'),
      window.utils.createElement('div', { style: 'padding: var(--space-4);' },
        this.create('title'),
        this.create('text'),
        this.create('text')
      )
    );
  }
}

// Form Builder Component
class FormBuilder {
  constructor(config) {
    this.config = config;
    this.form = null;
    this.validators = {};
  }
  
  build() {
    this.form = window.utils.createElement('form', {
      className: this.config.className || 'form',
      onSubmit: (e) => {
        e.preventDefault();
        this.handleSubmit();
      }
    });
    
    this.config.fields.forEach(field => {
      const fieldElement = this.createField(field);
      this.form.appendChild(fieldElement);
    });
    
    // Add submit button if specified
    if (this.config.submitButton) {
      const submitBtn = window.utils.createElement('button', {
        type: 'submit',
        className: `btn ${this.config.submitButton.className || ''}`,
        disabled: this.config.loading
      }, this.config.submitButton.text || 'Submit');
      
      this.form.appendChild(submitBtn);
    }
    
    return this.form;
  }
  
  createField(field) {
    const fieldContainer = window.utils.createElement('div', {
      className: 'form-group'
    });
    
    if (field.label) {
      const label = window.utils.createElement('label', {
        className: 'form-label',
        for: field.name
      }, field.label);
      fieldContainer.appendChild(label);
    }
    
    let input;
    
    switch (field.type) {
      case 'select':
        input = this.createSelect(field);
        break;
      case 'textarea':
        input = this.createTextarea(field);
        break;
      default:
        input = this.createInput(field);
    }
    
    fieldContainer.appendChild(input);
    
    if (field.validator) {
      this.validators[field.name] = field.validator;
    }
    
    return fieldContainer;
  }
  
  createInput(field) {
    return window.utils.createElement('input', {
      type: field.type || 'text',
      name: field.name,
      id: field.name,
      className: 'form-input',
      placeholder: field.placeholder || '',
      required: field.required || false,
      value: field.value || ''
    });
  }
  
  createSelect(field) {
    const select = window.utils.createElement('select', {
      name: field.name,
      id: field.name,
      className: 'form-input',
      required: field.required || false
    });
    
    if (field.placeholder) {
      const placeholderOption = window.utils.createElement('option', {
        value: '',
        disabled: true,
        selected: true
      }, field.placeholder);
      select.appendChild(placeholderOption);
    }
    
    field.options.forEach(option => {
      const optionElement = window.utils.createElement('option', {
        value: option.value
      }, option.label);
      select.appendChild(optionElement);
    });
    
    return select;
  }
  
  createTextarea(field) {
    return window.utils.createElement('textarea', {
      name: field.name,
      id: field.name,
      className: 'form-input',
      placeholder: field.placeholder || '',
      required: field.required || false,
      rows: field.rows || 4
    }, field.value || '');
  }
  
  handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    const validation = this.validate(data);
    if (!validation.isValid) {
      window.notifications.error(validation.errors[0]);
      return;
    }
    
    if (this.config.onSubmit) {
      this.config.onSubmit(data);
    }
  }
  
  validate(data) {
    const errors = [];
    
    Object.entries(this.validators).forEach(([fieldName, validator]) => {
      const result = validator(data[fieldName], data);
      if (result !== true) {
        errors.push(result);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  getFormData() {
    if (!this.form) return {};
    
    const formData = new FormData(this.form);
    return Object.fromEntries(formData.entries());
  }
  
  setFormData(data) {
    if (!this.form) return;
    
    Object.entries(data).forEach(([key, value]) => {
      const field = this.form.querySelector(`[name=\"${key}\"]`);
      if (field) {
        field.value = value;
      }
    });
  }
  
  reset() {
    if (this.form) {
      this.form.reset();
    }
  }
}

// Data Table Component
class DataTable extends Component {
  constructor(container, config) {
    super(container);
    this.config = {
      columns: [],
      data: [],
      searchable: true,
      sortable: true,
      pagination: true,
      pageSize: 10,
      ...config
    };
    
    this.state = {
      currentPage: 1,
      searchTerm: '',
      sortColumn: null,
      sortDirection: 'asc',
      filteredData: this.config.data
    };
    
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    
    // Create table container
    const tableContainer = window.utils.createElement('div', {
      className: 'table-container'
    });
    
    // Add search if enabled
    if (this.config.searchable) {
      const searchContainer = window.utils.createElement('div', {
        className: 'table-search mb-4'
      });
      
      const searchInput = window.utils.createElement('input', {
        type: 'text',
        className: 'form-input',
        placeholder: 'Search...',
        value: this.state.searchTerm,
        onInput: (e) => this.handleSearch(e.target.value)
      });
      
      searchContainer.appendChild(searchInput);
      this.container.appendChild(searchContainer);
    }
    
    // Create table
    const table = window.utils.createElement('table', {
      className: 'table'
    });
    
    // Create header
    const thead = window.utils.createElement('thead');
    const headerRow = window.utils.createElement('tr');
    
    this.config.columns.forEach(column => {
      const th = window.utils.createElement('th', {
        className: this.config.sortable && column.sortable !== false ? 'sortable' : '',
        onClick: this.config.sortable && column.sortable !== false 
          ? () => this.handleSort(column.key) 
          : null
      }, column.title);
      
      if (this.state.sortColumn === column.key) {
        th.classList.add(`sorted-${this.state.sortDirection}`);
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = window.utils.createElement('tbody');
    const paginatedData = this.getPaginatedData();
    
    if (paginatedData.length === 0) {
      const emptyRow = window.utils.createElement('tr');
      const emptyCell = window.utils.createElement('td', {
        colspan: this.config.columns.length,
        className: 'text-center text-muted'
      }, 'No data available');
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      paginatedData.forEach(row => {
        const tr = window.utils.createElement('tr');
        
        this.config.columns.forEach(column => {
          const td = window.utils.createElement('td');
          
          if (column.render) {
            const content = column.render(row[column.key], row);
            if (typeof content === 'string') {
              td.innerHTML = content;
            } else {
              td.appendChild(content);
            }
          } else {
            td.textContent = row[column.key] || '';
          }
          
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
    }
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    this.container.appendChild(tableContainer);
    
    // Add pagination if enabled
    if (this.config.pagination && this.state.filteredData.length > this.config.pageSize) {
      this.renderPagination();
    }
  }
  
  renderPagination() {
    const totalPages = Math.ceil(this.state.filteredData.length / this.config.pageSize);
    
    const paginationContainer = window.utils.createElement('div', {
      className: 'pagination mt-4',
      style: 'display: flex; justify-content: center; gap: var(--space-2);'
    });
    
    // Previous button
    const prevBtn = window.utils.createElement('button', {
      className: `btn secondary ${this.state.currentPage === 1 ? 'disabled' : ''}`,
      disabled: this.state.currentPage === 1,
      onClick: () => this.goToPage(this.state.currentPage - 1)
    }, 'Previous');
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, this.state.currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = window.utils.createElement('button', {
        className: `btn ${i === this.state.currentPage ? '' : 'secondary'}`,
        onClick: () => this.goToPage(i)
      }, i.toString());
      paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = window.utils.createElement('button', {
      className: `btn secondary ${this.state.currentPage === totalPages ? 'disabled' : ''}`,
      disabled: this.state.currentPage === totalPages,
      onClick: () => this.goToPage(this.state.currentPage + 1)
    }, 'Next');
    paginationContainer.appendChild(nextBtn);
    
    this.container.appendChild(paginationContainer);
  }
  
  handleSearch(searchTerm) {
    this.setState({
      searchTerm,
      currentPage: 1,
      filteredData: this.filterData(searchTerm)
    });
  }
  
  handleSort(column) {
    const direction = this.state.sortColumn === column && this.state.sortDirection === 'asc' 
      ? 'desc' : 'asc';
    
    const sortedData = [...this.state.filteredData].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.setState({
      sortColumn: column,
      sortDirection: direction,
      filteredData: sortedData,
      currentPage: 1
    });
  }
  
  filterData(searchTerm) {
    if (!searchTerm) return this.config.data;
    
    return this.config.data.filter(row => {
      return this.config.columns.some(column => {
        const value = row[column.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }
  
  getPaginatedData() {
    if (!this.config.pagination) return this.state.filteredData;
    
    const start = (this.state.currentPage - 1) * this.config.pageSize;
    const end = start + this.config.pageSize;
    
    return this.state.filteredData.slice(start, end);
  }
  
  goToPage(page) {
    const totalPages = Math.ceil(this.state.filteredData.length / this.config.pageSize);
    if (page >= 1 && page <= totalPages) {
      this.setState({ currentPage: page });
    }
  }
  
  updateData(newData) {
    this.config.data = newData;
    this.setState({
      filteredData: this.filterData(this.state.searchTerm),
      currentPage: 1
    });
  }
}

// Card Grid Component
class CardGrid extends Component {
  constructor(container, config) {
    super(container);
    this.config = {
      data: [],
      renderCard: null,
      columns: 3,
      loading: false,
      ...config
    };
    
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    
    if (this.config.loading) {
      // Show loading skeletons
      const grid = window.utils.createElement('div', {
        className: `grid grid-${this.config.columns}`
      });
      
      for (let i = 0; i < 6; i++) {
        grid.appendChild(SkeletonLoader.createCard());
      }
      
      this.container.appendChild(grid);
      return;
    }
    
    if (this.config.data.length === 0) {
      const emptyState = window.utils.createElement('div', {
        className: 'empty-state text-center',
        style: 'padding: var(--space-12);'
      }, 
        window.utils.createElement('div', {
          style: 'font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5;'
        }, '📦'),
        window.utils.createElement('h3', {
          className: 'text-xl font-semibold mb-4'
        }, 'No items found'),
        window.utils.createElement('p', {
          className: 'text-muted'
        }, 'There are no items to display at the moment.')
      );
      
      this.container.appendChild(emptyState);
      return;
    }
    
    const grid = window.utils.createElement('div', {
      className: `grid grid-${this.config.columns}`
    });
    
    this.config.data.forEach(item => {
      const card = this.config.renderCard ? this.config.renderCard(item) : this.defaultCardRenderer(item);
      grid.appendChild(card);
    });
    
    this.container.appendChild(grid);
  }
  
  defaultCardRenderer(item) {
    return window.utils.createElement('div', {
      className: 'card'
    }, JSON.stringify(item));
  }
  
  updateData(newData) {
    this.config.data = newData;
    this.render();
  }
  
  setLoading(loading) {
    this.config.loading = loading;
    this.render();
  }
}

// Export components
window.components = {
  Component,
  SkeletonLoader,
  FormBuilder,
  DataTable,
  CardGrid
};