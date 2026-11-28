const subjectText = document.getElementById('subject-text');
async function fetchSubjects() {
    try {
        subjectText.display = "block"
        subjectText.textContent = "Loading..."
        const response = await fetch('/api/mainModules/subjects');

        if (response.ok) {
            const subjects = await response.json();

            console.log(subjects)

            document.getElementById('subjects').replaceChildren(subjectText);

            if (subjects.length === 0) {
                subjectText.style.display = "block";
                subjectText.textContent = "You don't have any subjects yet.";   
                return;
            }


            subjects.forEach(e => {
                const card = document.createElement('div');
                card.style.backgroundColor = e.color;
                card.className = "subject-card";

                const name = document.createElement('p');
                name.textContent = e.name;
                name.className = "subject-name"
                card.appendChild(name);

                if (e.teacher) {
                    const teacher = document.createElement('p');
                    teacher.textContent = e.teacher;
                    teacher.className = "subject-teacher"
                    card.appendChild(teacher);
                }


                const editDiv = document.createElement('div');

                const edit =  document.createElement('button');
                edit.className = "editbtn"
                edit.textContent = "Edit";
                edit.addEventListener('click', () => editSubject({ name: e.name, color: e.color, teacher: e.teacher, id: e._id }));
                editDiv.appendChild(edit);

                const remove =  document.createElement('button');
                remove.className = "editbtn"
                remove.textContent = "Remove";
                remove.addEventListener('click', () => removeSubject(e._id));
                editDiv.appendChild(remove);

                card.appendChild(editDiv)

                document.getElementById('subjects').appendChild(card);
            });

            subjectText.style.display = "none"

        } else {
            console.log("Subject fetch response not okay");
            subjectText.textContent = "Error while fetching subjects"
        }

    } catch (err) {
        console.log("Error while fetching subjects:", err)
        subjectText.textContent = "Error while fetching subjects"
    }
}

async function addSubject() {
    try {
        const body = {
            name: document.getElementById('name').value,
            color: document.getElementById('color').value,
            teacher: document.getElementById('teacher').value,
        }

        const response = await fetch('/api/mainModules/subjects', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (response.ok) {

            document.getElementById('name').value = "",
            document.getElementById('color').value = "",
            document.getElementById('teacher').value = "",

            fetchSubjects();
        } else {
            console.log("Failed adding subject.");
        }
    } catch (err) {
        console.log("Error while adding subject:", err);
    }
}

function editSubject(subject) {
    document.getElementById("adddiv").style.display = "none";
    document.getElementById("editdiv").style.display = "grid";

    document.getElementById("editname").value = subject.name;
    document.getElementById("editcolor").value = subject.color;
    document.getElementById("editteacher").value = subject.teacher;

    document.getElementById("edit-button").addEventListener('click', () => saveEdit(subject.id));
}

async function saveEdit(subjectId) {
    
    const body = {
        subjectId: subjectId,
        name: document.getElementById("editname").value,
        color: document.getElementById("editcolor").value,
        teacher: document.getElementById("editteacher").value,
    };

    try {
        const response = await fetch('/api/mainModules/subjects', { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        })

        if (response.ok) {
            const data = await response.json();
            if (data.state == "success") {
                fetchSubjects();
                cancelEdit();
            }
        } else {
            console.log("Something went wrong while editing the subject.");
        }
        
    } catch (err) {
        console.log('Error while editing subject:', err);
    }

}

function cancelEdit() {
    document.getElementById("editdiv").style.display = "none";
    document.getElementById("adddiv").style.display = "grid";
    document.removeEventListener('click');
}

async function removeSubject(subject) {
    if(!confirm("Are you sure that you want to delete this subject?")) {
        return;
    }

    try {

        const response = await fetch('/api/mainModules/subjects', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({subjectId: subject})
        })

        if (response.ok) {
            const data = await response.json();
            if (data.state === "success") {
                fetchSubjects();
            }
        } else {
            console.log("Something went wrong while deleting the subject");
        }

    } catch (err) {
        console.log("Error while deleting this subject:", err)
    }

}

document.getElementById("editdiv").style.display = "none";
document.getElementById("add-subject").addEventListener("click", addSubject);
document.getElementById("cancel-edit-button").addEventListener("click", cancelEdit);
fetchSubjects();