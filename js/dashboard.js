// Thiết lập tính năng kéo rộng cột Excel (Excel-like Column Resizing) cho các bảng trên Dashboard
function initColumnResizing() {
    document.querySelectorAll('.data-table th').forEach(th => {
        // Không thêm thanh kéo rộng cột cho cột được ghim bên phải hoặc cột có class no-resize
        if (th.classList.contains('pin-right') || th.classList.contains('no-resize')) return;

        // Inject phần tử resizer vào góc phải th
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        th.appendChild(resizer);

        // Thiết lập các sự kiện mouse để thực hiện kéo rộng
        let startX, startWidth;

        resizer.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = th.offsetWidth;
            
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            function doResize(e) {
                const width = startWidth + (e.pageX - startX);
                if (width > 60) { // Giới hạn chiều rộng tối thiểu là 60px
                    th.style.width = width + 'px';
                    th.style.minWidth = width + 'px'; // Ép trình duyệt tuân thủ kích thước
                }
            }

            function stopResize() {
                document.removeEventListener('mousemove', doResize);
                document.removeEventListener('mouseup', stopResize);
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }

            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo tính năng kéo rộng cột Excel cho các bảng
    initColumnResizing();
});
