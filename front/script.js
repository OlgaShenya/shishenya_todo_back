(() => {
  const addInput = document.getElementById('inputAdd');
  const addButton = document.getElementById('buttonAdd');
  const list = document.querySelector('ul');
  const checkAllButton = document.getElementById('checkAll');
  const deleteAllCompleted = document.getElementById('deleteAllCompleted');
  const ENTER_BUTTON = 'Enter';
  const ESCAPE_BUTTON = 'Escape';
  const allTodos = document.getElementById('allTodos');
  const activeTodos = document.getElementById('activeTodos');
  const completedTodos = document.getElementById('completedTodos');
  const filterTodosList = document.getElementById('filterTodos');
  const pageList = document.getElementById('pageList');
  const PAGE_SIZE = 5;
  const { _ } = window;

  let currentPage = 1;


  const showPageBtns = (pageCount) => {
    let pageBtns = '';
    for (let i = 1; i <= pageCount; i += 1) {
      pageBtns += `<button type="button" class="btn ${currentPage !== i ? 'btn-warning' : 'btn-light'}" id=${i}>${i}</button>`;
    }
    pageList.innerHTML = pageBtns;
  };

  const countTodoTypes = () => {
    fetch('http://localhost:3000/api/todos/count')
      .then(response => response.json())
      .then(counts => {
        allTodos.textContent = `All ${counts.active + counts.completed}`;
        activeTodos.textContent = `Active ${counts.active}`;
        completedTodos.textContent = `Completed ${counts.completed}`;
        checkAllButton.checked = (counts.active === 0) && (counts.completed > 0);
      })
  };

  const render = async () => {
    let li = '';
    let filter = getFilter();
    let active = (filter !== undefined) ? `&active=${filter}` : '';
    let response = await fetch(`http://localhost:3000/api/todos?page=${currentPage - 1}&size=${PAGE_SIZE}${active}`);
    let todos = await response.json();

    showPageBtns(Math.ceil(todos.count / PAGE_SIZE));
    todos.rows.forEach((item) => {
      const checked = item.ischecked ? 'checked' : '';
      li += `<li id=${item.id}>
          <input type="checkbox" ${checked}>
          <span>${item.text}</span>
          <input type="text" id="inputEdit" class="hidden" value="${item.text}">
          <button id="myBtnStyle" type="button" class="btn btn-success">X</button></li>`;
    });
    list.innerHTML = li;
    countTodoTypes();
  };

  const validateTask = (text) => {
    text
      .replaceAll('?', 'U+003F')
      .replaceAll('№', 'U+2116')
      .replaceAll(':', 'U+003A')
      .replaceAll('%', 'U+0025')
      .replaceAll(';', 'U+003B')
      .replaceAll('*', 'U+002A')
      .replaceAll('.', 'U+002E')
      .replaceAll('"', 'U+0022')
      .replaceAll('\'', 'U+0027')
      .replace(/ +/g, ' ');

    return text;
  };

  const addTask = async () => {
    const text = _.escape(validateTask(addInput.value.trim()));
    if (text) {
      const task = {
        text,
        isChecked: checkAllButton.checked,
      };

      let response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        alert(`Error: ${response.status} ${response.statusText}`);
      } else {
        addInput.value = '';
        currentPage = 1;
      }
    }

    render();
  };


  const setPage = (event) => {
    currentPage = Number(event.target.id);
    render();
  };

  const checkKey = (event) => {
    if (event.key === ENTER_BUTTON) addTask();
  };

  const checkAllTasks = (event) => {
    fetch(`http://localhost:3000/api/todos?isChecked=${event.target.checked}`, {
      method: 'PUT'
    })
      .then(response => {
        if (response.ok) {
          render();
        } else {
          response.json().then((res) => alert(`${response.status} ${res.error}`));
        }
      });
  };

  const checkTask = (event) => {
    fetch(`http://localhost:3000/api/todos/${event.target.parentNode.id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({ isChecked: event.target.checked })
    })
      .then(response => {
        if (response.ok) {
          render();
        } else {
          response.json().then((res) => alert(`${response.status} ${res.error}`));
        }
      });
  };

  const renameTask = (event) => {
    if (event.target.id === 'inputEdit') {
      fetch(`http://localhost:3000/api/todos/${event.target.parentNode.id}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ text: validateTask(_.escape(event.target.value)) })
      })
        .then(response => {
          if (response.ok) {
            render();
          } else {
            response.json().then((res) => alert(`${response.status} ${res.error}`));
          }
        });
      event.target.previousElementSibling.classList.toggle('hidden');
      event.target.classList.toggle('hidden');
    }
  };

  const handleKeys = (event) => {
    if (event.key === ENTER_BUTTON) {
      renameTask(event);
    } else if (event.key === ESCAPE_BUTTON) {
      event.target.value = event.target.previousElementSibling.textContent;
      render();
    }
  };

  const deleteTask = (event) => {
    fetch(`http://localhost:3000/api/todos?id=${event.target.parentNode.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          render();
        } else {
          response.json().then((res) => alert(`${response.status} ${res.error}`));
        }
      });
  };

  const deleteAllDone = () => {
    fetch(`http://localhost:3000/api/todos?isChecked=true`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          checkAllButton.checked = false;
          render();
        } else {
          response.json().then((res) => alert(`${response.status} ${res.error}`));
        }
      });
  };

  const operateTask = (event) => {
    const {
      type,
      localName,
      classList,
      nextElementSibling,
    } = event.target;
    if (type === 'checkbox') { checkTask(event); }
    if (type === 'button') { deleteTask(event); }
    if (localName === 'span' && event.detail === 2) {
      classList.toggle('hidden');
      nextElementSibling.classList.toggle('hidden');
      nextElementSibling.focus();
    }
  };

  const setFilter = (target) => {
    allTodos.classList.remove('btn-light');
    completedTodos.classList.remove('btn-light');
    activeTodos.classList.remove('btn-light');
    target.classList.add('btn-light');
  }

  const getFilter = () => {
    switch (document.querySelector('.btn-light').id) {
      case 'activeTodos':
        return false;
      case 'completedTodos':
        return true;
    }
    return undefined;
  }

  const changeFilterStatus = (event) => {
    setFilter(event.target);
    console.log(event.target.id, getFilter());
    currentPage = 1;
    render();
  };

  addButton.addEventListener('click', addTask);
  addInput.addEventListener('keydown', checkKey);
  checkAllButton.addEventListener('click', checkAllTasks);
  list.addEventListener('click', operateTask);
  list.addEventListener('keydown', handleKeys);
  list.addEventListener('blur', renameTask, true);
  deleteAllCompleted.addEventListener('click', deleteAllDone);
  filterTodosList.addEventListener('click', changeFilterStatus);
  pageList.addEventListener('click', setPage);

  render();
})();