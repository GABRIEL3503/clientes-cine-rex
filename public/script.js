document.addEventListener('DOMContentLoaded', () => {
    openPopup('welcomePopup');
});

// Preload sounds
const sounds = {
    popupOpen: new Audio('sound/level-up-2-199574.mp3'),
    popupClose: new Audio('sound/transition-fleeting-121419.mp3'),
    error: new Audio('sound/error-4-199275.mp3'),
    confirmation: new Audio('sound/marimba-win-f-2-209688.mp3'),
    transition: new Audio('sound/whipy-woosh-transition-38006.mp3')
};

function playSound(sound) {
    sound.currentTime = 0; // Reset sound to start
    sound.play();
}

function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.style.display = 'flex';
    popup.classList.remove('animate__bounceOut'); // Reset any previous exit animation
    popup.classList.add('animate__bounceIn');

    playSound(sounds.popupOpen);

    // Remove the bounceIn class after animation ends to allow it to reapply
    popup.addEventListener('animationend', function handleAnimationEnd() {
        popup.classList.remove('animate__bounceIn');
        popup.removeEventListener('animationend', handleAnimationEnd);
    });
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.add('animate__bounceOut');

    playSound(sounds.popupClose);

    popup.addEventListener('animationend', function handleAnimationEnd() {
        popup.style.display = 'none';
        popup.classList.remove('animate__bounceOut');
        popup.removeEventListener('animationend', handleAnimationEnd);
    }, { once: true });
}

function nextStep(currentStep) {
    const current = document.getElementById(`step${currentStep}`);
    const next = document.getElementById(`step${currentStep + 1}`);

    if (validateInput(currentStep)) {
        console.log(`Step ${currentStep} input valid`);
        playSound(sounds.transition); // Play transition sound
        current.classList.add('animate__backOutLeft');
        current.addEventListener('animationend', function handleAnimationEnd() {
            current.style.display = 'none';
            current.classList.remove('animate__backOutLeft');
            current.removeEventListener('animationend', handleAnimationEnd);

            if (next) {
                next.style.display = 'flex';
                next.classList.add('animate__backInRight');
                next.addEventListener('animationend', function handleNextAnimationEnd() {
                    next.classList.remove('animate__backInRight');
                    next.removeEventListener('animationend', handleNextAnimationEnd);
                });
            }
        });
    } else {
        console.log(`Step ${currentStep} input invalid`);
        current.classList.remove('animate__wobble'); // Reset animation class

        // Force reflow to restart animation
        void current.offsetHeight; // Trigger reflow

        // Use requestAnimationFrame to ensure the class is added back in the next frame
        requestAnimationFrame(() => {
            current.classList.add('animate__wobble');
        });

        playSound(sounds.error); // Play error sound

        console.log(`Applied wobble animation to step ${currentStep}`);
    }
}

function validateInput(step) {
    let input, isValid = true;

    if (step === 1) {
        input = document.getElementById('name');
        const regex = /^[a-zA-Z\s]+$/;
        if (!regex.test(input.value.trim())) {
            isValid = false;
            console.log(`Name input invalid`);
        }
    } else if (step === 2) {
        input = document.getElementById('phone');
        const regex = /^\d{10}$/;
        if (!regex.test(input.value.trim())) {
            isValid = false;
            console.log(`Phone input invalid`);
        }
    } else if (step === 3) {
        input = document.getElementById('dni');
        const regex = /^\d{8}$/;
        if (!regex.test(input.value.trim())) {
            isValid = false;
            console.log(`DNI input invalid`);
        }
    }

    if (input.value.trim() === '' || !isValid) {
        console.log(`Input for step ${step} is invalid or empty`);
        return false;
    }
    console.log(`Input for step ${step} is valid`);
    return true;
}

function submitForm() {
    if (validateInput(3)) {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const dni = document.getElementById('dni').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone, dni }),
        })
        .then(response => response.json())
        .then(data => {
            openPopup('finishPopup');
            playSound(sounds.confirmation); // Play confirmation sound
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        nextStep(3);
    }
}
