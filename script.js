let DB;
const content = document.querySelector('.questions');
const form = document.querySelector('form');
const fname1 = document.querySelector('#qno');
const lname1 = document.querySelector('#question');
const email1 = document.querySelector('#answer');
const submit = document.querySelector('button');

document.addEventListener('DOMContentLoaded', () => {
    // create the database
    let ScheduleDB = window.indexedDB.open('QnA_DB', 1);

    // if there's an error
    ScheduleDB.onerror = function () {
        console.log('error');
    }
    // if everything is fine, assign the result is to the (letDB) instance 
    ScheduleDB.onsuccess = function () {
        console.log('Database Ready');


        DB = ScheduleDB.result;

        showConsultations();
    }


    ScheduleDB.onupgradeneeded = function (e) {

        let DB = e.target.result;

        let objectStore = DB.createObjectStore('QnA_tb', { keyPath: 'key', autoIncrement: true });


        objectStore.createIndex('qna', 'qna', { unique: false });
        objectStore.createIndex('question', 'question', { unique: false });
        objectStore.createIndex('answer', 'answer', { unique: false });

        //console.log('Database ready and fields created!');
    }

    form.addEventListener('submit', addConsultations);

    function addConsultations(e) {
        e.preventDefault();
        let newConsultation = {
            questionNo: qno.value,
            question: question.value,
            answer: answer.value,
        }

        let transaction = DB.transaction(['QnA_tb'], 'readwrite');
        let objectStore = transaction.objectStore('QnA_tb');

        let request = objectStore.add(newConsultation);
        request.onsuccess = () => {
            form.reset();
        }
        transaction.oncomplete = () => {
            showConsultations();
        }
        transaction.onerror = () => {
        }

    }
    function showConsultations() {

        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        let objectStore = DB.transaction('QnA_tb').objectStore('QnA_tb');

        objectStore.openCursor().onsuccess = function (e) {

            let cursor = e.target.result;
            if (cursor) {
                let QuestionsHTML = document.createElement('div');
                QuestionsHTML.setAttribute('data-consultation-id', cursor.value.key);


                QuestionsHTML.innerHTML = `  
                <h5>${cursor.value.questionNo}. ${cursor.value.question}</h5>
                <p> ${cursor.value.answer} </p>
            `;

                const cancelBtn = document.createElement('span');
                cancelBtn.classList.add('badge','text-bg-danger','mb-4');
                cancelBtn.innerHTML = 'Delete';
                cancelBtn.style.cursor='pointer'
                cancelBtn.onclick = removeConsultation;

                QuestionsHTML.appendChild(cancelBtn);
                content.appendChild(QuestionsHTML);

                cursor.continue();
            } else {
                if (!content.firstChild) {
                    let noSchedule = document.createElement('p');
                    noSchedule.style.color='#8722e6'
                    noSchedule.classList.add('text-center');
                    noSchedule.textContent = 'Your Questions will showing here ';
                    content.appendChild(noSchedule);
                }
            }
        }
    }
    function removeConsultation(e) {

        let scheduleID = Number(e.target.parentElement.getAttribute('data-consultation-id'));

        let transaction = DB.transaction(['QnA_tb'], 'readwrite');
        let objectStore = transaction.objectStore('QnA_tb');

        objectStore.delete(scheduleID);

        transaction.oncomplete = () => {

            e.target.parentElement.parentElement.removeChild(e.target.parentElement);

            if (!content.firstChild) {
                let noSchedule = document.createElement('p');
                noSchedule.style.color='#8722e6'
                noSchedule.classList.add('text-center');
                noSchedule.textContent = 'Your Questions will showing here';
                content.appendChild(noSchedule);
            }
        }
    }
});