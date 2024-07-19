document.addEventListener('DOMContentLoaded', function () {
    const logos = document.querySelectorAll('.logo');
    const logoContainers = document.querySelectorAll('.logo-container');

    console.log('DOM loaded, found', logoContainers.length, 'logo containers');

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
                console.log('Updated position for', id, 'to', data.left, data.top);
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
                let newLeft = pageX - shiftX;
                let newTop = pageY - shiftY;
                
                // Limiter le déplacement à l'intérieur du conteneur de la carte
                const mapContainer = document.getElementById('map-container');
                const mapRect = mapContainer.getBoundingClientRect();
                
                newLeft = Math.max(0, Math.min(newLeft, mapRect.width - container.offsetWidth));
                newTop = Math.max(0, Math.min(newTop, mapRect.height - container.offsetHeight));

                container.style.left = newLeft + 'px';
                container.style.top = newTop + 'px';
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

function updateLogoPosition(id, left, top) {
    fetch('/update-logo-position', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: 'filter-' + id, left: left, top: top })
    });
}