/**
 * project-form.js
 * Redirect logic for project-form.html.
 *
 * Per ASSUMPTION A09 (MASTER IMPLEMENTATION PLAN § Assumptions):
 * The spec §6.1 defines Create/Edit Project as a Modal (implemented in PART-02
 * inside project-list.html). project-form.html is therefore not a functional
 * form page; it redirects to project-list.html to handle any direct URL access.
 *
 * If the URL contains ?id=<projectId>, redirect with #edit=<id> so that
 * project-list.js auto-opens the edit modal for that project.
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        window.location.replace(
            `/pages/project/project-list.html#edit=${encodeURIComponent(id)}`
        );
    } else {
        window.location.replace('/pages/project/project-list.html');
    }
});
