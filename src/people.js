// @ts-check
/// <reference path="../types.d.ts" />

/**
 * @param {PeopleFile} myjson
 */
function render_students(myjson) {
  const people = myjson["current"];
  const students_list = document.getElementById('students_list');
  if (!students_list) return;
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const person_li = document.createElement('li');
    const link = document.createElement('a');
    link.href = person.homepage;
    link.textContent = person.name;
    person_li.appendChild(link);
    person_li.appendChild(document.createTextNode(
      " \u2013 " + person.degree + " @ " + person.currently
    ));
    if (person.coadvisors !== undefined) {
      person_li.appendChild(document.createTextNode(" \u2013 co-advised with: " + person.coadvisors));
    }
    students_list.appendChild(person_li);
  }
}

/**
 * @param {PeopleFile} myjson
 */
function render_alumni(myjson) {
  const people = myjson["alumni"];
  const alumni_list = document.getElementById('alumni_list');
  if (!alumni_list) return;
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const person_li = document.createElement('li');
    const link = document.createElement('a');
    link.href = person.homepage;
    link.textContent = person.name;
    person_li.appendChild(link);
    person_li.appendChild(document.createTextNode(
      " \u2013 " + person.degree + " (" + person.time + ") " +
      "co-advised with: " + person.coadvisors +
      " \u2013 currently " + person.currently
    ));
    alumni_list.appendChild(person_li);
  }
}

export function make_students() {
  fetch("/data/people.json")
    .then(function(r) { return r.json(); })
    .then(render_students)
    .catch(function() { console.error("people.json: file not found / JSON syntax incorrect"); });
}

export function make_alumni() {
  fetch("/data/people.json")
    .then(function(r) { return r.json(); })
    .then(render_alumni)
    .catch(function() { console.error("people.json: file not found / JSON syntax incorrect"); });
}
