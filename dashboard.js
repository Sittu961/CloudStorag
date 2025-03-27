// import { Client, Account, ID, Storage } from 'appwrite';

// document.addEventListener('DOMContentLoaded', () => {
//     const client = new Client()
//         .setEndpoint('https://cloud.appwrite.io/v1')
//         .setProject('67ddc1cd0024602b01e1');

//     const account = new Account(client);
//     const storage = new Storage(client);

//     const sidebarLinks = document.querySelectorAll('.sidebar a');
//     const searchInput = document.getElementById('searchInput');
//     const uploadBtn = document.getElementById('uploadBtn');
//     const fileInput = document.getElementById('fileInput');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const fileList = document.getElementById('fileList');
//     const storagePercent = document.getElementById('storagePercent');
//     const modal = document.getElementById('fileModal');
//     const modalInfo = document.getElementById('modalInfo');
//     const modalClose = document.getElementById('modalClose');
//     const spinner = document.getElementById('spinner');

//     const BUCKET_ID = '67ddd15600244565f769'; // Correct bucket ID

//     let filesData = [];
//     let currentTag = '';

//     async function checkAuth() {
//         try {
//             await account.get();
//         } catch (error) {
//             window.location.href = 'index.html';
//         }
//     }

//     function formatBytes(bytes) {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     }

//     async function fetchFiles() {
//         spinner.classList.remove('hidden');
//         try {
//             const response = await storage.listFiles(BUCKET_ID);
//             filesData = response.files;
//             console.log('Fetched files:', filesData); // Debug log
//             updateStats();
//             renderFiles();
//         } catch (error) {
//             console.error('Error fetching files:', error);
//             if (error.code === 404) {
//                 alert('Storage bucket not found. Please contact the administrator to verify the bucket ID.');
//             }
//         } finally {
//             spinner.classList.add('hidden');
//         }
//     }

//     function updateStats() {
//         // Debug log to inspect filesData
//         console.log('Files data for stats:', filesData);

//         // Calculate total size, ensuring file.size is a valid number
//         const totalSize = filesData.reduce((acc, file) => {
//             const size = Number(file.size) || 0; // Fallback to 0 if file.size is undefined or not a number
//             console.log(`File: ${file.name}, Size: ${size}`); // Debug log
//             return acc + size;
//         }, 0);

//         const maxStorage = 2 * 1024 * 1024 * 1024; // 2GB in bytes
//         const percent = (totalSize / maxStorage) * 100;

//         // Update Available Storage tile
//         storagePercent.textContent = `${percent.toFixed(2)}%`;
//         storagePercent.parentElement.children[1].textContent = `${formatBytes(totalSize)} / 2GB`;

//         // Define file categories
//         const categories = {
//             Documents: ['pdf', 'doc', 'docx', 'txt'],
//             Images: ['jpg', 'jpeg', 'png', 'gif'],
//             Media: ['mp4', 'mp3', 'mov', 'mkv'], // Added 'mkv' for MKV files
//             Others: []
//         };

//         // Update stats for each category
//         Object.keys(categories).forEach(category => {
//             const categoryFiles = filesData.filter(file => {
//                 const ext = file.name.split('.').pop().toLowerCase();
//                 if (category === 'Others') return !['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'mov', 'mkv'].includes(ext);
//                 return categories[category].includes(ext);
//             });

//             const size = categoryFiles.reduce((acc, file) => {
//                 const fileSize = Number(file.size) || 0; // Fallback to 0 if file.size is undefined or not a number
//                 return acc + fileSize;
//             }, 0);

//             const card = document.querySelector(`.stat-card[data-tag="${category}"] p`);
//             card.textContent = formatBytes(size);
//         });
//     }

//     function renderFiles() {
//         fileList.innerHTML = '';
//         const filteredFiles = filesData.filter(file => {
//             if (!currentTag) return true;
//             const ext = file.name.split('.').pop().toLowerCase();
//             const categories = {
//                 Documents: ['pdf', 'doc', 'docx', 'txt'],
//                 Images: ['jpg', 'jpeg', 'png', 'gif'],
//                 Media: ['mp4', 'mp3', 'mov', 'mkv'] // Added 'mkv' for filtering
//             };
//             if (currentTag === 'Others') return !['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'mov', 'mkv'].includes(ext);
//             return categories[currentTag]?.includes(ext);
//         }).filter(file => file.name.toLowerCase().includes(searchInput.value.toLowerCase()));

//         filteredFiles.forEach(file => {
//             const li = document.createElement('li');
//             const thumbnail = document.createElement('img');
//             thumbnail.className = 'thumbnail';
//             thumbnail.src = file.mimeType.startsWith('image/') ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=67ddc1cd0024602b01e1` : 'https://via.placeholder.com/40';
//             const link = document.createElement('a');
//             link.className = 'file-link';
//             link.textContent = file.name;
//             link.href = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=67ddc1cd0024602b01e1`;
//             link.target = '_blank';
//             const actions = document.createElement('div');
//             const infoBtn = document.createElement('button');
//             infoBtn.textContent = 'Info';
//             const downloadBtn = document.createElement('button');
//             downloadBtn.textContent = 'Download';
//             const deleteBtn = document.createElement('button');
//             deleteBtn.textContent = 'Delete';

//             infoBtn.onclick = () => {
//                 if (modal && modalInfo) {
//                     modalInfo.innerHTML = `
//                         <h2>${file.name}</h2>
//                         <p>Size: ${formatBytes(Number(file.size) || 0)}</p>
//                         <p>Uploaded: ${new Date(file.$createdAt).toLocaleString()}</p>
//                     `;
//                     modal.classList.remove('hidden');
//                 } else {
//                     console.error('Modal or modalInfo element not found');
//                 }
//             };

//             downloadBtn.onclick = async () => {
//                 const url = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/download?project=67ddc1cd0024602b01e1`;
//                 window.location.href = url;
//             };

//             deleteBtn.onclick = async () => {
//                 if (confirm('Are you sure you want to delete this file?')) {
//                     await storage.deleteFile(BUCKET_ID, file.$id);
//                     filesData = filesData.filter(f => f.$id !== file.$id);
//                     updateStats();
//                     renderFiles();
//                 }
//             };

//             actions.append(infoBtn, downloadBtn, deleteBtn);
//             li.append(thumbnail, link, actions);
//             fileList.appendChild(li);
//         });
//     }

//     function initDragAndDrop() {
//         if (!document.body) {
//             console.error('document.body is null, cannot initialize drag-and-drop');
//             return;
//         }

//         document.body.ondragover = (e) => {
//             e.preventDefault();
//         };

//         document.body.ondrop = async (e) => {
//             e.preventDefault();
//             const files = e.dataTransfer.files;
//             spinner.classList.remove('hidden');
//             try {
//                 for (const file of files) {
//                     await storage.createFile(BUCKET_ID, ID.unique(), file);
//                 }
//                 await fetchFiles();
//             } catch (error) {
//                 console.error('Error uploading files via drag and drop:', error);
//             } finally {
//                 spinner.classList.add('hidden');
//             }
//         };
//     }

//     function initModal() {
//         if (modalClose && modal) {
//             modalClose.onclick = () => {
//                 modal.classList.add('hidden');
//             };
//         } else {
//             console.error('modalClose or modal element not found');
//         }
//     }

//     sidebarLinks.forEach(link => {
//         link.onclick = (e) => {
//             e.preventDefault();
//             sidebarLinks.forEach(l => l.classList.remove('active'));
//             link.classList.add('active');
//             currentTag = link.dataset.tag;
//             renderFiles();
//         };
//     });

//     searchInput.oninput = () => renderFiles();

//     uploadBtn.onclick = () => fileInput.click();

//     fileInput.onchange = async () => {
//         const files = fileInput.files;
//         spinner.classList.remove('hidden');
//         try {
//             for (const file of files) {
//                 await storage.createFile(BUCKET_ID, ID.unique(), file);
//             }
//             await fetchFiles();
//         } catch (error) {
//             console.error('Error uploading files:', error);
//         } finally {
//             spinner.classList.add('hidden');
//             fileInput.value = '';
//         }
//     };

//     logoutBtn.onclick = async () => {
//         await account.deleteSession('current');
//         window.location.href = 'index.html';
//     };

//     initDragAndDrop();
//     initModal();

//     checkAuth();
//     fetchFiles();
// });


import { Client, Account, ID, Storage } from 'appwrite';

document.addEventListener('DOMContentLoaded', () => {
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('67ddc1cd0024602b01e1');

    const account = new Account(client);
    const storage = new Storage(client);

    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const searchInput = document.getElementById('searchInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const logoutBtn = document.getElementById('logoutBtn');
    const fileList = document.getElementById('fileList');
    const storagePercent = document.getElementById('storagePercent');
    const modal = document.getElementById('fileModal');
    const modalInfo = document.getElementById('modalInfo');
    const modalClose = document.getElementById('modalClose');
    const spinner = document.getElementById('spinner');

    const BUCKET_ID = '67ddd15600244565f769'; // Correct bucket ID

    let filesData = [];
    let currentTag = '';

    async function checkAuth() {
        try {
            await account.get();
        } catch (error) {
            window.location.href = 'index.html';
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function fetchFiles() {
        spinner.classList.remove('hidden');
        try {
            const response = await storage.listFiles(BUCKET_ID);
            filesData = response.files;
            console.log('Fetched files:', filesData); // Debug log
            updateStats();
            renderFiles();
        } catch (error) {
            console.error('Error fetching files:', error);
            if (error.code === 404) {
                alert('Storage bucket not found. Please contact the administrator to verify the bucket ID.');
            }
        } finally {
            spinner.classList.add('hidden');
        }
    }

    function updateStats() {
        // Debug log to inspect filesData
        console.log('Files data for stats:', filesData);

        // Calculate total size, using file.sizeOriginal
        const totalSize = filesData.reduce((acc, file) => {
            const size = Number(file.sizeOriginal) || 0; // Use sizeOriginal instead of size
            console.log(`File: ${file.name}, Size: ${size}`); // Debug log
            return acc + size;
        }, 0);

        const maxStorage = 2 * 1024 * 1024 * 1024; // 2GB in bytes
        const percent = (totalSize / maxStorage) * 100;

        // Update Available Storage tile
        storagePercent.textContent = `${percent.toFixed(2)}%`;
        storagePercent.parentElement.children[1].textContent = `${formatBytes(totalSize)} / 2GB`;

        // Define file categories
        const categories = {
            Documents: ['pdf', 'doc', 'docx', 'txt'],
            Images: ['jpg', 'jpeg', 'png', 'gif'],
            Media: ['mp4', 'mp3', 'mov', 'mkv'], // Includes 'mkv' for MKV files
            Others: []
        };

        // Update stats for each category
        Object.keys(categories).forEach(category => {
            const categoryFiles = filesData.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                if (category === 'Others') return !['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'mov', 'mkv'].includes(ext);
                return categories[category].includes(ext);
            });

            const size = categoryFiles.reduce((acc, file) => {
                const fileSize = Number(file.sizeOriginal) || 0; // Use sizeOriginal instead of size
                return acc + fileSize;
            }, 0);

            const card = document.querySelector(`.stat-card[data-tag="${category}"] p`);
            card.textContent = formatBytes(size);
        });
    }

    function renderFiles() {
        fileList.innerHTML = '';
        const filteredFiles = filesData.filter(file => {
            if (!currentTag) return true;
            const ext = file.name.split('.').pop().toLowerCase();
            const categories = {
                Documents: ['pdf', 'doc', 'docx', 'txt'],
                Images: ['jpg', 'jpeg', 'png', 'gif'],
                Media: ['mp4', 'mp3', 'mov', 'mkv']
            };
            if (currentTag === 'Others') return !['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'mov', 'mkv'].includes(ext);
            return categories[currentTag]?.includes(ext);
        }).filter(file => file.name.toLowerCase().includes(searchInput.value.toLowerCase()));

        filteredFiles.forEach(file => {
            const li = document.createElement('li');
            const thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = file.mimeType.startsWith('image/') ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=67ddc1cd0024602b01e1` : 'https://via.placeholder.com/40';
            const link = document.createElement('a');
            link.className = 'file-link';
            link.textContent = file.name;
            link.href = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=67ddc1cd0024602b01e1`;
            link.target = '_blank';
            const actions = document.createElement('div');
            const infoBtn = document.createElement('button');
            infoBtn.textContent = 'Info';
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';

            infoBtn.onclick = () => {
                if (modal && modalInfo) {
                    modalInfo.innerHTML = `
                        <h2>${file.name}</h2>
                        <p>Size: ${formatBytes(Number(file.sizeOriginal) || 0)}</p>
                        <p>Uploaded: ${new Date(file.$createdAt).toLocaleString()}</p>
                    `;
                    modal.classList.remove('hidden');
                } else {
                    console.error('Modal or modalInfo element not found');
                }
            };

            downloadBtn.onclick = async () => {
                const url = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/download?project=67ddc1cd0024602b01e1`;
                window.location.href = url;
            };

            deleteBtn.onclick = async () => {
                if (confirm('Are you sure you want to delete this file?')) {
                    await storage.deleteFile(BUCKET_ID, file.$id);
                    filesData = filesData.filter(f => f.$id !== file.$id);
                    updateStats();
                    renderFiles();
                }
            };

            actions.append(infoBtn, downloadBtn, deleteBtn);
            li.append(thumbnail, link, actions);
            fileList.appendChild(li);
        });
    }

    function initDragAndDrop() {
        if (!document.body) {
            console.error('document.body is null, cannot initialize drag-and-drop');
            return;
        }

        document.body.ondragover = (e) => {
            e.preventDefault();
        };

        document.body.ondrop = async (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            spinner.classList.remove('hidden');
            try {
                for (const file of files) {
                    await storage.createFile(BUCKET_ID, ID.unique(), file);
                }
                await fetchFiles();
            } catch (error) {
                console.error('Error uploading files via drag and drop:', error);
            } finally {
                spinner.classList.add('hidden');
            }
        };
    }

    function initModal() {
        if (modalClose && modal) {
            modalClose.onclick = () => {
                modal.classList.add('hidden');
            };
        } else {
            console.error('modalClose or modal element not found');
        }
    }

    sidebarLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentTag = link.dataset.tag;
            renderFiles();
        };
    });

    searchInput.oninput = () => renderFiles();

    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = async () => {
        const files = fileInput.files;
        spinner.classList.remove('hidden');
        try {
            for (const file of files) {
                await storage.createFile(BUCKET_ID, ID.unique(), file);
            }
            await fetchFiles();
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            spinner.classList.add('hidden');
            fileInput.value = '';
        }
    };

    logoutBtn.onclick = async () => {
        await account.deleteSession('current');
        window.location.href = 'index.html';
    };

    initDragAndDrop();
    initModal();

    checkAuth();
    fetchFiles();
});