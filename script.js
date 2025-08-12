class IonChannelViewer {
    constructor() {
        this.data = [];
        this.pdbFiles = [];
        this.currentSort = { column: null, direction: 'asc' };
        this.init();
    }

    // 改进的CSV解析函数
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // 跳过空行
            
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            // 确保关键字段存在
            if (row.Channel && row.Channel.trim() !== '') {
                result.push(row);
            }
        }
        
        return result;
    }

    async init() {
        this.loadPDBFiles();
        this.setupEventListeners();
        
        try {
            await this.loadData();
            this.renderTable();
            this.setupSortableHeaders();
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    async loadData() {
        // 先尝试通过fetch读取（适用于服务器环境）
        try {
            const response = await fetch('mpnn_results.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.data = this.parseCSV(csvText);
                console.log('Data loaded via fetch:', this.data.length, 'records');
                return;
            }
        } catch (error) {
            console.log('Fetch method failed, trying alternative...');
        }

        // 如果fetch失败，使用嵌入的备份数据（适用于本地文件环境）
        console.log('Using embedded backup data...');
        const backupData = `Channel,design,n,mpnn,plddt,i_ptm,i_pae,rmsd,seq
Nav1.2,0,0,1.670964132,0.264105022,0.10404928,25.90797788,28.1592617,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLIVKLLAEK
Nav1.2,0,1,1.716530679,0.305697739,0.180560946,23.28447151,31.25585365,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLEVLKLAKK
Nav1.2,1,0,1.619780026,0.279690266,0.135494381,25.08698273,24.42000198,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLLFLLVKKL
Nav1.2,1,1,1.61258087,0.279690266,0.135494381,25.08698273,24.42000198,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLLFLLVKKL
Nav1.2,2,0,1.311588447,0.220756114,0.121419363,24.86878633,26.43888092,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/DYYLPVLALI
Nav1.2,2,1,1.35445842,0.568643898,0.531189084,14.48365211,5.720145226,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/DYYLPEILKI
BK,3,0,1.526939876,0.292473793,0.115163632,25.07905775,26.69474792,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLFEILKLLG
BK,3,1,1.574088685,0.312396586,0.111420222,25.31439567,33.38283157,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/SLWELLKKLG
BK,4,0,1.466576026,0.302256465,0.13748911,25.06625843,29.09628677,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LVILLILILM
BK,4,1,1.487688349,0.30949384,0.21154502,21.88833278,18.87038803,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LVVFLILLLM
BK,5,0,1.392094557,0.284580708,0.157770783,24.48585063,3.397523403,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/SLALEIVEKE
KCNQ,5,1,1.45593213,0.247543395,0.126129374,24.66247094,8.533480644,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/ALALELVAKE
KCNQ,6,0,1.645189093,0.304338515,0.150696963,24.34013015,29.90740204,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LISKLILKLL
KCNQ,6,1,1.605413864,0.309301257,0.149298012,24.26525956,22.95729637,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLFLIILKLL
KCNQ,7,0,1.560803638,0.31350708,0.168339461,23.56371921,30.58870125,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/YSLYMIIKEL
KCNQ,7,1,1.33681414,0.553117067,0.479515672,16.27376497,32.23592377,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/KSLYEIIKEL`;
        
        this.data = this.parseCSV(backupData);
        console.log('Loaded backup data:', this.data.length, 'records');
        
        // 显示提示信息
        this.showDataUpdateNotice();
    }

    showDataUpdateNotice() {
        const container = document.querySelector('.container');
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: linear-gradient(135deg, var(--warning-color), var(--success-color));
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            box-shadow: var(--shadow);
            animation: fadeIn 0.5s ease-out;
        `;
        notice.innerHTML = `
            <strong>💡 Notice:</strong> Currently using embedded data<br>
            <small>To use the latest CSV data, please run the website via a local server</small>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                margin-left: 10px;
                cursor: pointer;
            ">×</button>
        `;
        container.insertBefore(notice, container.firstChild);
    }

    loadPDBFiles() {
        // 直接嵌入PDB文件列表
        this.pdbFiles = [
            'design0_n0.pdb', 'design0_n1.pdb', 'design1_n0.pdb', 'design1_n1.pdb',
            'design2_n0.pdb', 'design2_n1.pdb', 'design3_n0.pdb', 'design3_n1.pdb',
            'design4_n0.pdb', 'design4_n1.pdb', 'design5_n0.pdb', 'design5_n1.pdb',
            'design6_n0.pdb', 'design6_n1.pdb', 'design7_n0.pdb', 'design7_n1.pdb'
        ];
    }

    
    setupEventListeners() {
        // 搜索功能事件监听
        const searchInput = document.getElementById('searchInput');
        const clearButton = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', (e) => {
            this.filterData(e.target.value);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            this.filterData('');
        });
    }

    renderTable(filteredData = null) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        let dataToShow = filteredData || this.data;
        
        // 应用排序
        if (this.currentSort.column) {
            dataToShow = this.sortData(dataToShow, this.currentSort.column, this.currentSort.direction);
        }
        
        dataToShow.forEach(row => {
            // 提取最后一个'/'后面的内容作为Seq
            const extractedSeq = row.seq && row.seq.includes('/') ? row.seq.split('/').pop() : '';
            
            // 为每一行添加extracted_seq属性以支持排序
            row.extracted_seq = extractedSeq;
            
            const tr = document.createElement('tr');
            
            const pdbFile = `design${row.design}_n${row.n}.pdb`;
            const hasPDB = this.pdbFiles.includes(pdbFile);
            
            tr.innerHTML = `
                <td>${row.Channel}</td>
                <td>${row.design}</td>
                <td>${row.n}</td>
                <td class="${this.getScoreClass(parseFloat(row.mpnn), 1.5, 1.3)}">${row.mpnn}</td>
                <td class="${this.getScoreClass(parseFloat(row.plddt), 0.7, 0.5)}">${row.plddt}</td>
                <td class="${this.getScoreClass(parseFloat(row.i_ptm), 0.5, 0.3)}">${row.i_ptm}</td>
                <td class="${this.getScoreClass(parseFloat(row.i_pae), 0.3, 0.2)}">${row.i_pae}</td>
                <td class="${this.getScoreClass(parseFloat(row.rmsd), 20, 30, true)}">${row.rmsd}</td>
                <td><strong>${extractedSeq}</strong></td>
                <td>
                    ${hasPDB ? `<button class="download-btn" onclick="viewer.downloadPDB('${pdbFile}', '${row.Channel}_design${row.design}_n${row.n}')">Download</button>` : 'No PDB'}
                </td>
            `;
            
            tbody.appendChild(tr);
        });

        // 确保表头和列宽度同步
        this.syncColumnWidths();
    }

    syncColumnWidths() {
        const headerTable = document.getElementById('headerTable');
        const dataTable = document.getElementById('dataTable');
        const headerCells = headerTable.querySelectorAll('th');
        const bodyCells = dataTable.querySelectorAll('tbody tr:first-child td');
        
        if (bodyCells.length > 0) {
            headerCells.forEach((header, index) => {
                if (bodyCells[index]) {
                    const width = bodyCells[index].offsetWidth;
                    header.style.width = width + 'px';
                    header.style.minWidth = width + 'px';
                    header.style.maxWidth = width + 'px';
                }
            });
        }

        // 同步水平滚动
        this.setupScrollSync();
    }

  setupScrollSync() {
        const headerContainer = document.querySelector('.header-container');
        const tableContainer = document.querySelector('.table-container');
        
        tableContainer.addEventListener('scroll', () => {
            headerContainer.scrollLeft = tableContainer.scrollLeft;
        });
        
        headerContainer.addEventListener('scroll', () => {
            tableContainer.scrollLeft = headerContainer.scrollLeft;
        });
    }

    getScoreClass(value, goodThreshold, mediumThreshold, reverse = false) {
        if (reverse) {
            if (value <= goodThreshold) return 'score-good';
            if (value <= mediumThreshold) return 'score-medium';
            return 'score-poor';
        } else {
            if (value >= goodThreshold) return 'score-good';
            if (value >= mediumThreshold) return 'score-medium';
            return 'score-poor';
        }
    }

    sortData(data, column, direction) {
        return data.slice().sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];
            
            // 尝试转换为数字
            const numA = parseFloat(valueA);
            const numB = parseFloat(valueB);
            
            if (!isNaN(numA) && !isNaN(numB)) {
                valueA = numA;
                valueB = numB;
            }
            
            if (valueA < valueB) {
                return direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    handleSort(column) {
        // 如果点击的是同一列，切换排序方向
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // 新列，默认升序
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        
        this.updateSortIndicators();
        this.renderTable();
    }

    updateSortIndicators() {
        // 移除所有排序指示器
        const headers = document.querySelectorAll('#headerTable th[data-sortable]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            const indicator = header.querySelector('.sort-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // 添加当前排序指示器
        if (this.currentSort.column) {
            const currentHeader = document.querySelector(`#headerTable th[data-column="${this.currentSort.column}"]`);
            if (currentHeader) {
                currentHeader.classList.add(this.currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
                const indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.textContent = this.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
                currentHeader.appendChild(indicator);
            }
        }
    }

    setupSortableHeaders() {
        const sortableHeaders = document.querySelectorAll('#headerTable th[data-sortable]');
        sortableHeaders.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                this.handleSort(column);
            });
        });
    }

    
    downloadPDB(filename, displayName) {
        // 创建下载链接
        const link = document.createElement('a');
        
        // 处理 baseurl - 检查是否是开发环境
        const baseUrl = document.querySelector('base')?.getAttribute('href') || '';
        let finalUrl;
        
        // 如果 baseurl 包含 Jekyll 模板语法或为空，使用相对路径
        if (baseUrl.includes('{{') || baseUrl === '' || baseUrl === '/') {
            finalUrl = `all_pdb/${filename}`;
        } else {
            finalUrl = `${baseUrl}all_pdb/${filename}`;
        }
        
        link.href = finalUrl;
        link.download = `${displayName}.pdb`;
        
        // 测试文件是否存在
        fetch(finalUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // 文件存在，执行下载
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    // 文件不存在，显示错误
                    this.showDownloadError(filename, finalUrl);
                }
            })
            .catch(error => {
                // 网络错误，尝试直接下载
                try {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (err) {
                    this.showDownloadError(filename, finalUrl);
                }
            });
    }
    
    showDownloadError(filename, url) {
        const errorMessage = `Unable to download PDB file: ${filename}\n` +
                           `URL: ${url}\n\n` +
                           `Please check:\n` +
                           `1. The file exists in the all_pdb/ directory\n` +
                           `2. GitHub Pages deployment completed successfully\n` +
                           `3. File permissions are correct`;
        alert(errorMessage);
    }

    filterData(searchTerm) {
        if (!searchTerm.trim()) {
            // 如果搜索框为空，显示所有数据
            this.renderTable();
            this.updateSearchResultCount(this.data.length, this.data.length);
            return;
        }

        const filteredData = this.data.filter(row => {
            const searchLower = searchTerm.toLowerCase();
            // 只匹配通道名称开头，确保搜索"K"只显示K开头的通道
            return row.Channel.toLowerCase().startsWith(searchLower);
        });

        this.renderTable(filteredData);
        this.updateSearchResultCount(filteredData.length, this.data.length);
    }

    updateSearchResultCount(filteredCount, totalCount) {
        const searchInput = document.getElementById('searchInput');
        const existingCount = document.querySelector('.search-result-count');
        
        if (existingCount) {
            existingCount.remove();
        }

        if (filteredCount < totalCount) {
            const countElement = document.createElement('div');
            countElement.className = 'search-result-count';
            countElement.textContent = `Showing ${filteredCount} / ${totalCount} results`;
            searchInput.parentNode.appendChild(countElement);
        }
    }
}

const viewer = new IonChannelViewer();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ion Channel Data Viewer loaded');
});
