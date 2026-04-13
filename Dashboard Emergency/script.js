const personnel = [
    { id: 'p1', name: "Riej Admin", role: "Lead Developer", dept: "ENGINEERING", time: "08:30A", email: "riej@apex.com", phone: "+63 912 345 6789", img: "https://i.pravatar.cc/150?u=riej" },
    { id: 'p2', name: "John Doe", role: "Hardware Intern", dept: "ENGINEERING", time: "09:12A", email: "john@apex.com", phone: "+63 912 999 0000", img: "https://i.pravatar.cc/150?u=john" },
    { id: 'p3', name: "Jane Smith", role: "HR Manager", dept: "HUMAN RESOURCES", time: "08:05A", email: "jane@apex.com", phone: "+63 912 111 2222", img: "https://i.pravatar.cc/150?u=jane" },
    { id: 'p4', name: "Mike Ross", role: "Coordinator", dept: "LOGISTICS", time: "07:50A", email: "mike@apex.com", phone: "+63 912 555 4444", img: "https://i.pravatar.cc/150?u=mike" },
    { id: 'p5', name: "Jwong", role: "Admin", dept: "Admin", time: "07:50A", email: "Jjjwong@yo.com", phone: "+63 912 435 5434", img: "https://i.pravatar.cc/150?u=mike" },
    { id: 'p6', name: "Halu", role: "EmergencyPersonel", dept: "Emergency", time: "08:50A", email: "Jbtgt@yo.com", phone: "+63 912 442 5145", img: "https://i.pravatar.cc/150?u=halu" }
];

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (localStorage.getItem('sidebar-collapsed') === 'true') sidebar?.classList.add('collapsed');
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
    
    document.getElementById('toggleBtn')?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });

    updateEmergencyUI();
    
    // Page-specific initializations
    if (document.getElementById('personnel-grid')) renderDashboard();
    if (document.getElementById('log-container')) loadLogs();
    if (document.getElementById('barChart')) renderCharts();
    if (document.getElementById('rescueTeamList')) renderRescueTeam();
});

// 1. Dashboard Logic (Excludes Emergency Team)
function renderDashboard() {
    const grid = document.getElementById('personnel-grid');
    if (!grid) return;

    const civilianPersonnel = personnel.filter(p => p.dept.toUpperCase() !== "EMERGENCY");
    const depts = [...new Set(civilianPersonnel.map(p => p.dept))];

    grid.innerHTML = depts.map(d => `
        <div class="dept-container">
            <div class="dept-label">${d}</div>
            ${civilianPersonnel.filter(p => p.dept === d).map(p => `
                <div class="person-card not-safe" id="card-${p.id}" onclick="showPopup('${p.id}')">
                    <div style="font-weight:800; font-size:0.9rem;">${p.name}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${p.role}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${p.time}</div>
                    <button class="status-pill" style="background:var(--emergency-red); color:white;" 
                        onclick="event.stopPropagation(); toggleSafe('${p.id}')">NOT SAFE</button>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// 2. Rescue Team Logic
function renderRescueTeam() {
    const list = document.getElementById('rescueTeamList');
    if (!list) return;
    
    const team = personnel.filter(p => p.dept.toUpperCase() === "EMERGENCY");
    list.innerHTML = team.map(p => `
        <div class="rescue-card-v2">
            <div class="rescue-header">
                <img src="${p.img}" class="rescue-avatar" alt="${p.name}">
            </div>
            <div class="rescue-body">
                <h4>${p.name}</h4>
                <span>${p.role}</span>
            </div>
            <div class="rescue-footer">
                <button class="rescue-action-btn" title="Call ${p.phone}"><i class="ph ph-phone"></i></button>
                <button class="rescue-action-btn" title="Message ${p.email}"><i class="ph ph-chat-centered-text"></i></button>
            </div>
        </div>
    `).join('');
}

// 3. Analytics & Chart.js Config
function renderCharts() {
    const barCanvas = document.getElementById('barChart');
    const pieCanvas = document.getElementById('pieChart');
    const eventDropdown = document.getElementById('eventFilter');
    const deptDropdown = document.getElementById('deptFilter');

    if (!barCanvas || !pieCanvas) return;

    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    const eventIndex = eventDropdown?.value;

    // Populate Event Dropdown
    if (eventDropdown && eventDropdown.options.length <= 1 && history.length > 0) {
        history.forEach((event, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `Event: ${event.timestamp}`;
            eventDropdown.appendChild(opt);
        });
    }

    let dataSource = (eventIndex === "LATEST" || !eventIndex) 
        ? (history[0]?.safetyData || personnel) 
        : history[eventIndex].safetyData;

    const selectedDept = deptDropdown ? deptDropdown.value : "ALL";
    const filteredData = selectedDept === "ALL" 
        ? dataSource 
        : dataSource.filter(p => p.dept.toUpperCase() === selectedDept.toUpperCase());

    let safeCount = filteredData.filter(p => p.status === "SAFE").length;
    let notSafeCount = filteredData.length - safeCount;

    // Hotspots rendering
    const hotspotsContainer = document.getElementById('deptHotspots');
    if (hotspotsContainer) {
        const depts = [...new Set(personnel.map(p => p.dept))].filter(d => d.toUpperCase() !== "EMERGENCY");
        hotspotsContainer.innerHTML = depts.map(d => {
            const deptPersonnel = personnel.filter(p => p.dept === d);
            const deptSafe = deptPersonnel.filter(p => dataSource.find(src => src.name === p.name)?.status === "SAFE").length;
            const percent = Math.round((deptSafe / deptPersonnel.length) * 100) || 0;
            const color = percent === 100 ? '#10b981' : (percent < 50 ? '#ef4444' : '#f59e0b');
            return `
                <div style="margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px; color:var(--text-main);">
                        <span>${d}</span><span>${percent}%</span>
                    </div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                        <div style="width:${percent}%; height:100%; background:${color}; transition: width 0.4s ease;"></div>
                    </div>
                </div>`;
        }).join('');
    }

    // Chart Design Customization
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#64748b' : '#94a3b8';

    if (window.myBarChart) window.myBarChart.destroy();
    if (window.myPieChart) window.myPieChart.destroy();

    window.myBarChart = new Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Safe', 'Not Safe'],
            datasets: [{
                data: [safeCount, notSafeCount],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: textColor, stepSize: 1 } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });

    window.myPieChart = new Chart(pieCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Safe', 'Not Safe'],
            datasets: [{
                data: [safeCount, notSafeCount],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 20 } } }
        }
    });
}

// 4. UI & Modal Helpers
function showPopup(id) {
    const p = personnel.find(person => person.id === id);
    const modal = document.getElementById('personModal');
    if (!modal || !p) return;
    document.getElementById('modalImg').src = p.img;
    document.getElementById('modalName').innerText = p.name;
    document.getElementById('modalInfo').innerHTML = `${p.role}<br>${p.phone}<br>${p.email}`;
    modal.style.display = 'flex';
}

function closePopup() {
    const modal = document.getElementById('personModal');
    if (modal) modal.style.display = 'none';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    const icon = document.querySelector('#themeIcon i');
    if(icon) icon.className = target === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
    if (document.getElementById('barChart')) renderCharts();
}

function toggleSafe(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;
    const pill = card.querySelector('.status-pill');
    const isSafe = card.classList.toggle('safe');
    card.classList.toggle('not-safe', !isSafe);
    pill.innerText = isSafe ? "SAFE" : "NOT SAFE";
    pill.style.background = isSafe ? "var(--safe-green)" : "var(--emergency-red)";
}

function toggleEmergency() {
    const isEmer = localStorage.getItem('emergencyMode') === 'true';
    const now = new Date().getTime();

    if (!isEmer) {
        localStorage.setItem('emergencyMode', 'true');
        localStorage.setItem('startTime', now);
    } else {
        const start = parseInt(localStorage.getItem('startTime'));
        const durationSec = Math.floor((now - start) / 1000);
        const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
        
        const safetySnapshot = personnel.map(p => {
            const card = document.getElementById(`card-${p.id}`);
            return { 
                name: p.name, 
                dept: p.dept, 
                status: card?.classList.contains('safe') ? "SAFE" : "NOT SAFE" 
            };
        });

        history.unshift({
            timestamp: new Date().toLocaleString(),
            duration: `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
            safetyData: safetySnapshot
        });

        localStorage.setItem('emergencyHistory', JSON.stringify(history));
        localStorage.setItem('emergencyMode', 'false');
    }
    updateEmergencyUI();
}

function updateEmergencyUI() {
    const isEmer = localStorage.getItem('emergencyMode') === 'true';
    document.body.classList.toggle('emergency-active', isEmer);
    const btn = document.getElementById('panicBtn');
    if (btn) {
        btn.innerText = isEmer ? "RESET SYSTEM" : "TRIGGER EMERGENCY";
        btn.style.background = isEmer ? "var(--safe-green)" : "var(--emergency-red)";
    }
}

function loadLogs() {
    const container = document.getElementById('log-container');
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    if (container) {
        container.innerHTML = history.map((h, i) => `
            <div style="padding:15px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                <div><strong>EVENT TRIGGERED</strong><br><small>${h.timestamp} (${h.duration})</small></div>
                <button onclick="exportReport(${i})" style="background:var(--accent-blue); color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">
                    <i class="ph ph-file-xls"></i>
                </button>
            </div>`).join('') || '<p style="padding:20px;">No records.</p>';
    }
}

async function exportReport(index) {
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    const event = history[index];
    if (!event) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Emergency Report');

    // 1. Header: "EMERGENCY" (Big Red Banner)
    worksheet.mergeCells('A1:D1');
    const mainHeader = worksheet.getCell('A1');
    mainHeader.value = 'EMERGENCY';
    mainHeader.font = { name: 'Arial Black', size: 16, color: { argb: 'FFFFFFFF' } };
    mainHeader.alignment = { vertical: 'middle', horizontal: 'center' };
    mainHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };

    // 2. Sub-header: Timestamp
    worksheet.mergeCells('A2:D2');
    const subHeader = worksheet.getCell('A2');
    subHeader.value = `Event Log: ${event.timestamp}`;
    subHeader.font = { italic: true, size: 11 };
    subHeader.alignment = { horizontal: 'center' };

    worksheet.addRow([]); // Spacer

    // 3. Define Table Columns
    const tableHeader = worksheet.addRow(['ID', 'Name', 'Department', 'Status']);
    tableHeader.font = { bold: true };
    
    worksheet.getColumn(1).width = 10; 
    worksheet.getColumn(2).width = 25; 
    worksheet.getColumn(3).width = 20; 
    worksheet.getColumn(4).width = 15;

    // 4. Filter and Add Data
    // We filter out any personnel whose department is "EMERGENCY"
    const civilianData = event.safetyData.filter(p => p.dept.toUpperCase() !== "EMERGENCY");

    civilianData.forEach((person) => {
        const originalPerson = personnel.find(p => p.name === person.name);
        const personID = originalPerson ? originalPerson.id : 'N/A';

        const row = worksheet.addRow([
            personID,
            person.name,
            person.dept,
            person.status
        ]);

        const statusCell = row.getCell(4);
        statusCell.alignment = { horizontal: 'center' };

        // Apply "Tile" styling (Solid background colors)
        if (person.status === 'SAFE') {
            statusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF10B981' } // Green
            };
            statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else {
            statusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEF4444' } // Red
            };
            statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
    });

    // Generate and Trigger Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Emergency_Report_${event.timestamp.split(',')[0].replace(/\//g, '-')}.xlsx`);
}