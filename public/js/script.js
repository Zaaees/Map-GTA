document.addEventListener('DOMContentLoaded', function () {
    const logos = document.querySelectorAll('.logo');
    const logoContainers = document.querySelectorAll('.logo-container');
    let isAdminMode = false;

    console.log('DOM loaded, found', logoContainers.length, 'logo containers');

    // Fonction pour charger les logos
    function loadLogos() {
        fetch('/get-logos')
        .then(response => response.json())
        .then(savedLogos => {
            console.log('Loaded saved logos:', savedLogos);
            Object.entries(savedLogos).forEach(([id, data]) => {
                const container = document.querySelector(`.logo-container:has(#${id.replace('filter-', '')})`);
                if (container) {
                    container.style.left = data.left;
                    container.style.top = data.top;
                    if (data.width) {
                        container.style.width = data.width;
                    }
                    if (data.height) {
                        container.style.height = data.height;
                    }
                    console.log('Updated position and size for', id, 'to', data.left, data.top, data.width, data.height);

                    // Mise à jour de la taille de la pastille
                    const dot = container.querySelector('.status-dot');
                    dot.style.width = `${container.offsetWidth * 0.2}px`;
                    dot.style.height = `${container.offsetWidth * 0.2}px`;
                } else {
                    console.log('Container not found for', id);
                }
                const dotElement = document.getElementById('dot-' + id.replace('filter-', ''));
                if (dotElement) {
                    dotElement.style.backgroundColor = data.color;
                }
            });
        })
        .catch(error => console.error('Error loading logos:', error));
    }

    // Charger les logos initialement
    loadLogos();

    // Fonction pour activer/désactiver le mode admin
    function toggleAdminMode(enabled) {
        isAdminMode = enabled;
        logoContainers.forEach(container => {
            container.style.cursor = enabled ? 'grab' : 'default';
            container.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = enabled ? 'block' : 'none';
            });
        });
        logos.forEach(logo => {
            logo.style.pointerEvents = enabled ? 'auto' : 'none';
        });
    }

    // Initialiser en mode visiteur
    toggleAdminMode(false);

    // Gestion du bouton de connexion admin
    const adminLoginButton = document.getElementById('admin-login-button');
    const loginModal = document.getElementById('login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');

    adminLoginButton.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === 'Admin' && password === 'Gruppe6') {
            toggleAdminMode(true);
            loginModal.style.display = 'none';
            alert('Mode administrateur activé');
        } else {
            alert('Identifiants incorrects');
        }
    });

    // Charger les positions sauvegardées
    fetch('/get-logos')
    .then(response => response.json())
    .then(savedLogos => {
        console.log('Loaded saved logos:', savedLogos);
        Object.entries(savedLogos).forEach(([id, data]) => {
            const container = document.querySelector(`.logo-container:has(#${id.replace('filter-', '')})`);
            if (container) {
                container.style.left = data.left;
                container.style.top = data.top;
                if (data.width) {
                    container.style.width = data.width;
                }
                if (data.height) {
                    container.style.height = data.height;
                }
                console.log('Updated position and size for', id, 'to', data.left, data.top, data.width, data.height);

                // Mise à jour de la taille de la pastille
                const dot = container.querySelector('.status-dot');
                dot.style.width = `${container.offsetWidth * 0.2}px`;
                dot.style.height = `${container.offsetWidth * 0.2}px`;
            } else {
                console.log('Container not found for', id);
            }
            const dotElement = document.getElementById('dot-' + id.replace('filter-', ''));
            if (dotElement) {
                dotElement.style.backgroundColor = data.color;
            }
        });
    })
    .catch(error => console.error('Error loading logos:', error));

    function changeFilterColor(dotElement) {
        const currentColor = dotElement.style.backgroundColor;
        let newColor;
        switch (currentColor) {
            case 'transparent':
            case '':
                newColor = 'rgb(0, 255, 0)'; // Vert
                break;
            case 'rgb(0, 255, 0)':
                newColor = 'rgb(255, 165, 0)'; // Orange
                break;
            case 'rgb(255, 165, 0)':
                newColor = 'rgb(0, 0, 0)'; // Noir
                break;
            case 'rgb(0, 0, 0)':
                newColor = 'rgb(255, 0, 0)'; // Rouge
                break;
            case 'rgb(255, 0, 0)':
                newColor = 'transparent'; // Revenir à transparent
                break;
            default:
                newColor = 'transparent';
        }
        dotElement.style.backgroundColor = newColor;
        return newColor;
    }

    function addResizeHandles(container) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handleClass => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${handleClass}`;
            container.appendChild(handle);
        });
    }

    logoContainers.forEach(addResizeHandles);

    function initResize(e) {
        e.preventDefault();
        const container = this.parentElement;
        const startWidth = container.offsetWidth;
        const startHeight = container.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;
        const handle = this;

        function resize(e) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (handle.classList.contains('se') || handle.classList.contains('ne')) {
                container.style.width = `${startWidth + deltaX}px`;
            }
            if (handle.classList.contains('sw') || handle.classList.contains('nw')) {
                container.style.width = `${startWidth - deltaX}px`;
                container.style.left = `${container.offsetLeft + deltaX}px`;
            }
            if (handle.classList.contains('se') || handle.classList.contains('sw')) {
                container.style.height = `${startHeight + deltaY}px`;
            }
            if (handle.classList.contains('ne') || handle.classList.contains('nw')) {
                container.style.height = `${startHeight - deltaY}px`;
                container.style.top = `${container.offsetTop + deltaY}px`;
            }

            // Mettre à jour la taille de la pastille
            const dot = container.querySelector('.status-dot');
            dot.style.width = `${container.offsetWidth * 0.2}px`;
            dot.style.height = `${container.offsetWidth * 0.2}px`;
        }

        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    // Ajout des événements de redimensionnement
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });

    // Ajouter l'événement de clic sur chaque logo pour changer la couleur du filtre
    logos.forEach(logo => {
        logo.addEventListener('click', function () {
            console.log('Logo clicked:', this.id);
            const dotElement = document.getElementById('dot-' + this.id);
            if (dotElement) {
                console.log('Dot element found:', dotElement);
                const newColor = changeFilterColor(dotElement);
                console.log('New color:', newColor);
                updateLogoColor(this.id, newColor);
            } else {
                console.error('Dot element not found for logo:', this.id);
            }
        });
    });

    // Ajouter des événements pour le glisser-déposer des logos
    logoContainers.forEach(container => {
        container.addEventListener('mousedown', function (e) {
            console.log('Mousedown on container', this);
            e.preventDefault();
            const container = this;
            let shiftX = e.clientX - container.getBoundingClientRect().left;
            let shiftY = e.clientY - container.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                const mapContainer = document.getElementById('map-container');
                const mapRect = mapContainer.getBoundingClientRect();
                
                let newLeft = ((pageX - mapRect.left - shiftX) / mapRect.width) * 100;
                let newTop = ((pageY - mapRect.top - shiftY) / mapRect.height) * 100;
                
                newLeft = Math.max(0, Math.min(newLeft, 100));
                newTop = Math.max(0, Math.min(newTop, 100));
            
                container.style.left = newLeft + '%';
                container.style.top = newTop + '%';
            }

            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', onMouseMove);
                updateLogoPosition(container.querySelector('.logo').id, container.style.left, container.style.top);
                container.classList.remove('dragging');
            }, { once: true });

            container.classList.add('dragging');
        });

        container.ondragstart = function () {
            return false;
        };
    });
});

function updateLogoColor(id, color) {
    fetch('/update-logo-color', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: 'filter-' + id, color: color })
    });
}

function updateLogoPosition(id, left, top, width, height) {
    fetch('/update-logo-position', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: 'filter-' + id, left, top, width, height })
    });
}