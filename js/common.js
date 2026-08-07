document.addEventListener('DOMContentLoaded', () => {
    // Component Loader
    async function loadComponent(elementId, filePath) {
        const element = document.getElementById(elementId);
        if (element) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    element.innerHTML = await response.text();
                    initComponentEvents(elementId);
                    
                    // Xử lý đặc biệt cho loading component (vì thẻ div bọc ngoài bị đè display: none)
                    if(elementId === 'loading-container') {
                         const originalLoading = element.querySelector('#global-loading');
                         if(originalLoading) {
                             element.replaceWith(originalLoading);
                         }
                    }
                    if(elementId === 'modal-container') {
                         const originalModal = element.querySelector('#global-modal');
                         if(originalModal) {
                             // Kéo các script từ component ra để thực thi
                             const scripts = element.querySelectorAll('script');
                             scripts.forEach(script => {
                                 const newScript = document.createElement('script');
                                 newScript.textContent = script.textContent;
                                 document.body.appendChild(newScript);
                             });
                             element.replaceWith(originalModal);
                         }
                    }
                } else {
                    console.error(`Lỗi tải component ${filePath}:`, response.status);
                }
            } catch (error) {
                console.error(`Lỗi tải component ${filePath}:`, error);
            }
        }
    }

    // Khởi tạo các event sau khi component render xong
    function initComponentEvents(elementId) {
        if (elementId === 'header-container') {
            const toggleBtn = document.getElementById('menu-toggle');
            const sidebar = document.querySelector('.sidebar');
            
            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });
            }
        } else if (elementId === 'sidebar-container') {
            const toggleLinks = document.querySelectorAll('.submenu-toggle');
            toggleLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const submenu = link.nextElementSibling;
                    const arrow = link.querySelector('.arrow');
                    
                    // Đóng các submenu khác
                    document.querySelectorAll('.submenu').forEach(sub => {
                        if (sub !== submenu) {
                            sub.classList.remove('open');
                            const otherArrow = sub.previousElementSibling.querySelector('.arrow');
                            if (otherArrow) otherArrow.textContent = '▾';
                        }
                    });

                    if (submenu && submenu.classList.contains('submenu')) {
                        submenu.classList.toggle('open');
                        if(arrow) arrow.textContent = submenu.classList.contains('open') ? '▴' : '▾';
                    }
                });
            });
        }
    }

    // Load các component layout chung
    Promise.all([
        loadComponent('sidebar-container', '/components/sidebar.html'),
        loadComponent('header-container', '/components/header.html'),
        loadComponent('footer-container', '/components/footer.html'),
        loadComponent('modal-container', '/components/modal.html'),
        loadComponent('loading-container', '/components/loading.html')
    ]).then(() => {
        console.log("All components loaded successfully!");
    });
});
