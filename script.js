document.addEventListener('DOMContentLoaded', () => {
    // App state
    const state = {
        slides: [],
        currentSlideIndex: 0,
        presentationMode: false
    };

    // DOM elements
    const elements = {
        newSlideBtn: document.getElementById('newSlideBtn'),
        presentBtn: document.getElementById('presentBtn'),
        codeBtn: document.getElementById('codeBtn'),
        textBtn: document.getElementById('textBtn'),
        imageBtn: document.getElementById('imageBtn'),
        slidesSidebar: document.getElementById('slidesSidebar'),
        currentSlide: document.getElementById('currentSlide'),
        presentationMode: document.getElementById('presentationMode'),
        presentationSlide: document.getElementById('presentationSlide'),
        prevSlideBtn: document.getElementById('prevSlideBtn'),
        nextSlideBtn: document.getElementById('nextSlideBtn'),
        exitPresentBtn: document.getElementById('exitPresentBtn'),
        slideCounter: document.getElementById('slideCounter'),
        codeBlockTemplate: document.getElementById('codeBlockTemplate'),
        textBlockTemplate: document.getElementById('textBlockTemplate'),
        imageBlockTemplate: document.getElementById('imageBlockTemplate'),
        aiTextBtn: document.getElementById('aiTextBtn'),
        aiCodeBtn: document.getElementById('aiCodeBtn'),
        aiModal: document.getElementById('aiModal'),
        closeModal: document.querySelector('.close-modal'),
        aiModalTitle: document.getElementById('aiModalTitle'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        promptInput: document.getElementById('promptInput'),
        aiOptions: document.getElementById('aiOptions'),
        generateBtn: document.getElementById('generateBtn'),
        generationStatus: document.getElementById('generationStatus'),
        dynamicSlideBtn: document.getElementById('dynamicSlideBtn'),
        dynamicSlideModal: document.getElementById('dynamicSlideModal'),
        closeDynamicModal: document.getElementById('closeDynamicModal'),
        templateContent: document.getElementById('templateContent'),
        addVariableBtn: document.getElementById('addVariableBtn'),
        templatePartSelect: document.getElementById('templatePartSelect'),
        variablesContainer: document.getElementById('variablesContainer'),
        addVariablePairBtn: document.getElementById('addVariablePairBtn'),
        refreshPreviewBtn: document.getElementById('refreshPreviewBtn'),
        previewContainer: document.getElementById('previewContainer'),
        createDynamicSlideBtn: document.getElementById('createDynamicSlideBtn'),
        aiPresentationBtn: document.getElementById('aiPresentationBtn'),
        aiPresentationModal: document.getElementById('aiPresentationModal'),
        closeAiPresentationModal: document.getElementById('closeAiPresentationModal'),
        presentationApiKeyInput: document.getElementById('presentationApiKeyInput'),
        presentationTopicInput: document.getElementById('presentationTopicInput'),
        presentationDescriptionInput: document.getElementById('presentationDescriptionInput'),
        slidesCountInput: document.getElementById('slidesCountInput'),
        customSlidesCount: document.getElementById('customSlidesCount'),
        presentationStyleInput: document.getElementById('presentationStyleInput'),
        contentBalanceInput: document.getElementById('contentBalanceInput'),
        includeTitle: document.getElementById('includeTitle'),
        includeSummary: document.getElementById('includeSummary'),
        includeCode: document.getElementById('includeCode'),
        includeImages: document.getElementById('includeImages'),
        generatePresentationBtn: document.getElementById('generatePresentationBtn'),
        presentationGenerationStatus: document.getElementById('presentationGenerationStatus'),
        generationProgress: document.getElementById('generationProgress'),
        progressBarFill: document.querySelector('.progress-bar-fill'),
        progressText: document.querySelector('.progress-text')
    };

    // Current AI generation context
    let currentAiContext = {
        type: null, // 'text' or 'code'
        language: null // for code generation
    };

    // Initialize app
    init();

    function init() {
        // Create first slide if none exists
        if (state.slides.length === 0) {
            createNewSlide();
        }

        // Set up event listeners
        elements.newSlideBtn.addEventListener('click', createNewSlide);
        elements.presentBtn.addEventListener('click', togglePresentationMode);
        elements.codeBtn.addEventListener('click', addCodeBlock);
        elements.textBtn.addEventListener('click', addTextBlock);
        elements.imageBtn.addEventListener('click', addImageBlock);
        elements.prevSlideBtn.addEventListener('click', goToPrevSlide);
        elements.nextSlideBtn.addEventListener('click', goToNextSlide);
        elements.exitPresentBtn.addEventListener('click', togglePresentationMode);
        elements.aiTextBtn.addEventListener('click', () => openAiModal('text'));
        elements.aiCodeBtn.addEventListener('click', () => openAiModal('code'));
        elements.closeModal.addEventListener('click', closeAiModal);
        elements.generateBtn.addEventListener('click', generateAiContent);
        elements.dynamicSlideBtn.addEventListener('click', openDynamicSlideModal);
        elements.closeDynamicModal.addEventListener('click', closeDynamicSlideModal);
        elements.addVariableBtn.addEventListener('click', promptForVariable);
        elements.templatePartSelect.addEventListener('change', addTemplatePart);
        elements.addVariablePairBtn.addEventListener('click', addVariablePair);
        elements.refreshPreviewBtn.addEventListener('click', updatePreview);
        elements.createDynamicSlideBtn.addEventListener('click', createDynamicSlide);
        elements.aiPresentationBtn.addEventListener('click', openAiPresentationModal);
        elements.closeAiPresentationModal.addEventListener('click', closeAiPresentationModal);
        elements.generatePresentationBtn.addEventListener('click', generateAiPresentation);
        elements.slidesCountInput.addEventListener('change', toggleCustomSlidesCount);

        // Keyboard shortcuts for presentation mode
        document.addEventListener('keydown', (e) => {
            if (state.presentationMode) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    goToNextSlide();
                } else if (e.key === 'ArrowLeft') {
                    goToPrevSlide();
                } else if (e.key === 'Escape') {
                    togglePresentationMode();
                }
            }
        });

        // Render initial state
        renderSlides();

        // Check if API key is saved in localStorage
        if (localStorage.getItem('openai_api_key')) {
            elements.apiKeyInput.value = localStorage.getItem('openai_api_key');
        }
    }

    function createNewSlide() {
        const newSlide = {
            id: Date.now(),
            content: []
        };
        
        state.slides.push(newSlide);
        state.currentSlideIndex = state.slides.length - 1;
        renderSlides();
    }

    function renderSlides() {
        // Render sidebar thumbnails
        elements.slidesSidebar.innerHTML = '';
        state.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `slide-thumbnail ${index === state.currentSlideIndex ? 'active' : ''}`;
            thumbnail.addEventListener('click', () => {
                state.currentSlideIndex = index;
                renderSlides();
            });
            
            const thumbnailNumber = document.createElement('span');
            thumbnailNumber.className = 'slide-thumbnail-number';
            thumbnailNumber.textContent = index + 1;
            thumbnail.appendChild(thumbnailNumber);
            
            elements.slidesSidebar.appendChild(thumbnail);
        });
        
        // Render current slide in editor
        renderCurrentSlide();
        
        // Update slide counter
        updateSlideCounter();
    }

    function renderCurrentSlide() {
        const currentSlide = state.slides[state.currentSlideIndex];
        elements.currentSlide.innerHTML = '';
        
        if (currentSlide) {
            currentSlide.content.forEach(block => {
                let blockElement;
                
                if (block.type === 'code') {
                    blockElement = renderCodeBlock(block);
                } else if (block.type === 'text') {
                    blockElement = renderTextBlock(block);
                } else if (block.type === 'image') {
                    blockElement = renderImageBlock(block);
                } else if (block.type === 'dynamic') {
                    blockElement = renderDynamicBlock(block);
                }
                
                if (blockElement) {
                    elements.currentSlide.appendChild(blockElement);
                }
            });
        }
    }

    function addCodeBlock() {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        const newBlock = {
            id: Date.now(),
            type: 'code',
            language: 'javascript',
            content: ''
        };
        
        currentSlide.content.push(newBlock);
        renderCurrentSlide();
    }

    function addTextBlock() {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        const newBlock = {
            id: Date.now(),
            type: 'text',
            content: ''
        };
        
        currentSlide.content.push(newBlock);
        renderCurrentSlide();
    }

    function addImageBlock() {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        const newBlock = {
            id: Date.now(),
            type: 'image',
            src: ''
        };
        
        currentSlide.content.push(newBlock);
        renderCurrentSlide();
    }

    function renderCodeBlock(block) {
        const template = elements.codeBlockTemplate.content.cloneNode(true);
        const codeBlock = template.querySelector('.code-block');
        const languageSelect = template.querySelector('.language-select');
        const codeContent = template.querySelector('.code-content');
        const deleteBtn = template.querySelector('.delete-block-btn');
        
        languageSelect.value = block.language || 'javascript';
        codeContent.value = block.content || '';
        
        languageSelect.addEventListener('change', (e) => {
            block.language = e.target.value;
        });
        
        codeContent.addEventListener('input', (e) => {
            block.content = e.target.value;
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteContentBlock(block.id);
        });
        
        return codeBlock;
    }

    function renderTextBlock(block) {
        const template = elements.textBlockTemplate.content.cloneNode(true);
        const textBlock = template.querySelector('.text-block');
        const textContent = template.querySelector('.text-content');
        const deleteBtn = template.querySelector('.delete-block-btn');
        
        textContent.value = block.content || '';
        
        textContent.addEventListener('input', (e) => {
            block.content = e.target.value;
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteContentBlock(block.id);
        });
        
        return textBlock;
    }

    function renderImageBlock(block) {
        const template = elements.imageBlockTemplate.content.cloneNode(true);
        const imageBlock = template.querySelector('.image-block');
        const imageUpload = template.querySelector('.image-upload');
        const imagePreview = template.querySelector('.image-preview');
        const deleteBtn = template.querySelector('.delete-block-btn');
        
        if (block.src) {
            const img = document.createElement('img');
            img.src = block.src;
            imagePreview.appendChild(img);
        }
        
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    block.src = event.target.result;
                    imagePreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = block.src;
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteContentBlock(block.id);
        });
        
        return imageBlock;
    }

    function deleteContentBlock(blockId) {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        const blockIndex = currentSlide.content.findIndex(block => block.id === blockId);
        if (blockIndex !== -1) {
            currentSlide.content.splice(blockIndex, 1);
            renderCurrentSlide();
        }
    }

    function togglePresentationMode() {
        state.presentationMode = !state.presentationMode;
        
        if (state.presentationMode) {
            elements.presentationMode.style.display = 'flex';
            renderPresentationSlide();
        } else {
            elements.presentationMode.style.display = 'none';
        }
    }

    function renderPresentationSlide() {
        const currentSlide = state.slides[state.currentSlideIndex];
        elements.presentationSlide.innerHTML = '';
        
        if (currentSlide) {
            // Clone the current slide for presentation
            const slideContent = elements.currentSlide.cloneNode(true);
            
            // Remove the control buttons from the presentation
            const controlButtons = slideContent.querySelectorAll('.block-controls, .dynamic-slide-controls');
            controlButtons.forEach(btn => btn.remove());
            
            // Make text and code areas readonly
            const textareas = slideContent.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.setAttribute('readonly', true);
                textarea.style.border = 'none';
                textarea.style.resize = 'none';
                textarea.style.background = 'none';
            });
            
            // Hide file inputs
            const fileInputs = slideContent.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => input.style.display = 'none');
            
            // Update dynamic blocks if needed
            currentSlide.content.forEach((block, index) => {
                if (block.type === 'dynamic') {
                    const config = block.dynamicConfig;
                    
                    // Check if we should update based on config
                    if (config.dataSource === 'api' && 
                        (config.apiConfig.updateFrequency === 'presentation' || 
                        config.apiConfig.updateFrequency === 'slide')) {
                        
                        // Find the corresponding dynamic block in the presentation
                        const dynamicContents = slideContent.querySelectorAll('.dynamic-slide-content');
                        if (dynamicContents.length > index) {
                            updateDynamicBlockData(block, dynamicContents[index]);
                        }
                    }
                }
            });
            
            elements.presentationSlide.appendChild(slideContent);
        }
        
        updateSlideCounter();
    }

    function goToPrevSlide() {
        if (state.currentSlideIndex > 0) {
            state.currentSlideIndex--;
            if (state.presentationMode) {
                renderPresentationSlide();
            } else {
                renderSlides();
            }
        }
    }

    function goToNextSlide() {
        if (state.currentSlideIndex < state.slides.length - 1) {
            state.currentSlideIndex++;
            if (state.presentationMode) {
                renderPresentationSlide();
            } else {
                renderSlides();
            }
        }
    }

    function updateSlideCounter() {
        elements.slideCounter.textContent = `${state.currentSlideIndex + 1}/${state.slides.length}`;
    }

    function openAiModal(type) {
        currentAiContext.type = type;
        
        if (type === 'text') {
            elements.aiModalTitle.textContent = 'Generate Text with AI';
            elements.aiOptions.innerHTML = `
                <label for="textLengthSelect">Approximate Length:</label>
                <select id="textLengthSelect">
                    <option value="short">Short (1-2 paragraphs)</option>
                    <option value="medium" selected>Medium (3-4 paragraphs)</option>
                    <option value="long">Long (5+ paragraphs)</option>
                </select>
            `;
        } else if (type === 'code') {
            elements.aiModalTitle.textContent = 'Generate Code with AI';
            elements.aiOptions.innerHTML = `
                <label for="languageSelect">Programming Language:</label>
                <select id="languageSelect">
                    <option value="javascript" selected>JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                </select>
            `;
            currentAiContext.language = 'javascript'; // Default selection
            
            // Add event listener to update language context
            document.getElementById('languageSelect').addEventListener('change', (e) => {
                currentAiContext.language = e.target.value;
            });
        }
        
        elements.aiModal.style.display = 'block';
    }

    function closeAiModal() {
        elements.aiModal.style.display = 'none';
        elements.generationStatus.className = 'generation-status';
        elements.generationStatus.style.display = 'none';
        elements.generationStatus.textContent = '';
    }

    async function generateAiContent() {
        const apiKey = elements.apiKeyInput.value.trim();
        const prompt = elements.promptInput.value.trim();
        
        if (!apiKey) {
            showGenerationStatus('Please enter your OpenAI API key', 'error');
            return;
        }
        
        if (!prompt) {
            showGenerationStatus('Please enter a prompt', 'error');
            return;
        }
        
        // Save API key to localStorage for convenience
        localStorage.setItem('openai_api_key', apiKey);
        
        // Prepare the prompt based on type
        let fullPrompt = prompt;
        
        if (currentAiContext.type === 'text') {
            const length = document.getElementById('textLengthSelect').value;
            fullPrompt = `Generate ${length} text content about: ${prompt}`;
        } else if (currentAiContext.type === 'code') {
            fullPrompt = `Generate ${currentAiContext.language} code for: ${prompt}. Only provide the code, no explanations.`;
        }
        
        // Show loading state
        showGenerationStatus('Generating content...', 'loading');
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: currentAiContext.type === 'code' 
                                ? `You are a helpful code generator. Generate clean, working ${currentAiContext.language} code.` 
                                : 'You are a helpful content generator.'
                        },
                        {
                            role: 'user',
                            content: fullPrompt
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'Error connecting to OpenAI API');
            }
            
            const data = await response.json();
            const generatedContent = data.choices[0].message.content.trim();
            
            // Create appropriate block with the generated content
            if (currentAiContext.type === 'text') {
                addTextBlockWithContent(generatedContent);
            } else if (currentAiContext.type === 'code') {
                addCodeBlockWithContent(generatedContent, currentAiContext.language);
            }
            
            showGenerationStatus('Content generated successfully!', 'success');
            setTimeout(closeAiModal, 1500); // Close modal after 1.5 seconds
            
        } catch (error) {
            console.error('Error generating content:', error);
            showGenerationStatus(`Error: ${error.message}`, 'error');
        }
    }

    function showGenerationStatus(message, type) {
        elements.generationStatus.textContent = message;
        elements.generationStatus.className = `generation-status ${type}`;
        elements.generationStatus.style.display = 'block';
    }

    function addTextBlockWithContent(content) {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        const newBlock = {
            id: Date.now(),
            type: 'text',
            content: content
        };
        
        currentSlide.content.push(newBlock);
        renderCurrentSlide();
    }

    function addCodeBlockWithContent(content, language) {
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) return;
        
        // Clean up the code if it has Markdown code fence
        let cleanCode = content;
        const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
        const match = content.match(codeBlockRegex);
        
        if (match && match[1]) {
            cleanCode = match[1].trim();
        }
        
        const newBlock = {
            id: Date.now(),
            type: 'code',
            language: language,
            content: cleanCode
        };
        
        currentSlide.content.push(newBlock);
        renderCurrentSlide();
    }

    // Add this to the renderCurrentSlide function to handle dynamic blocks
    function renderDynamicBlock(block) {
        const dynamicBlock = document.createElement('div');
        dynamicBlock.className = 'content-block dynamic-slide-block';
        
        const controls = document.createElement('div');
        controls.className = 'block-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-block-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteContentBlock(block.id);
        });
        controls.appendChild(deleteBtn);
        
        const dynamicControls = document.createElement('div');
        dynamicControls.className = 'dynamic-slide-controls';
        
        const sourceType = document.createElement('span');
        sourceType.textContent = `Source: ${block.dynamicConfig.dataSource}`;
        
        const updateBtn = document.createElement('button');
        updateBtn.className = 'update-button';
        updateBtn.textContent = 'Update Data';
        updateBtn.addEventListener('click', () => {
            updateDynamicBlockData(block, dynamicContent);
        });
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-template-button';
        editBtn.textContent = 'Edit Template';
        editBtn.addEventListener('click', () => {
            editDynamicBlockTemplate(block);
        });
        
        dynamicControls.appendChild(sourceType);
        dynamicControls.appendChild(updateBtn);
        dynamicControls.appendChild(editBtn);
        
        const dynamicContent = document.createElement('div');
        dynamicContent.className = 'dynamic-slide-content';
        
        // Initial rendering of the dynamic content
        updateDynamicBlockData(block, dynamicContent);
        
        dynamicBlock.appendChild(controls);
        dynamicBlock.appendChild(dynamicControls);
        dynamicBlock.appendChild(dynamicContent);
        
        return dynamicBlock;
    }

    async function updateDynamicBlockData(block, container) {
        const config = block.dynamicConfig;
        let data;
        
        try {
            if (config.dataSource === 'manual') {
                data = config.variables;
            } else if (config.dataSource === 'function') {
                const functionBody = config.functionCode;
                const dataFunction = new Function(functionBody);
                data = dataFunction();
            } else if (config.dataSource === 'api') {
                container.innerHTML = '<div class="loading">Loading data from API...</div>';
                data = await fetchDataFromApi(config.apiConfig);
            }
            
            renderDynamicTemplate(container, config.template, data);
        } catch (error) {
            container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function editDynamicBlockTemplate(block) {
        // Load the block data into the modal
        currentDynamicSlide = JSON.parse(JSON.stringify(block.dynamicConfig)); // Deep copy
        
        // Populate the form
        elements.templateContent.value = currentDynamicSlide.template;
        
        // Set the data source radio button
        document.querySelector(`input[name="dataSource"][value="${currentDynamicSlide.dataSource}"]`).checked = true;
        
        // Hide all config sections and show the correct one
        document.querySelectorAll('.data-source-config').forEach(config => {
            config.style.display = 'none';
        });
        document.getElementById(`${currentDynamicSlide.dataSource}Config`).style.display = 'block';
        
        // Populate the manual variables
        elements.variablesContainer.innerHTML = '';
        if (currentDynamicSlide.dataSource === 'manual') {
            for (const [key, value] of Object.entries(currentDynamicSlide.variables)) {
                const pairDiv = document.createElement('div');
                pairDiv.className = 'variable-pair';
                
                const keyInput = document.createElement('input');
                keyInput.type = 'text';
                keyInput.value = key;
                keyInput.className = 'variable-key';
                
                const valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.value = value;
                valueInput.className = 'variable-value';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '×';
                deleteBtn.addEventListener('click', () => {
                    elements.variablesContainer.removeChild(pairDiv);
                });
                
                pairDiv.appendChild(keyInput);
                pairDiv.appendChild(valueInput);
                pairDiv.appendChild(deleteBtn);
                
                elements.variablesContainer.appendChild(pairDiv);
            }
        }
        
        // If no variables, add one empty pair
        if (elements.variablesContainer.children.length === 0) {
            addVariablePair();
        }
        
        // Populate API config
        if (currentDynamicSlide.dataSource === 'api') {
            document.getElementById('apiUrl').value = currentDynamicSlide.apiConfig.url;
            document.getElementById('apiDataPath').value = currentDynamicSlide.apiConfig.dataPath;
            document.getElementById('updateFrequency').value = currentDynamicSlide.apiConfig.updateFrequency;
            document.getElementById('updateInterval').value = currentDynamicSlide.apiConfig.updateInterval;
            
            if (currentDynamicSlide.apiConfig.updateFrequency === 'interval') {
                document.getElementById('intervalConfig').style.display = 'block';
            } else {
                document.getElementById('intervalConfig').style.display = 'none';
            }
        }
        
        // Populate function code
        if (currentDynamicSlide.dataSource === 'function') {
            document.getElementById('dataFunction').value = currentDynamicSlide.functionCode;
        }
        
        // Show the first tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector('.tab-btn[data-tab="template"]').classList.add('active');
        document.querySelector('.tab-content[data-tab="template"]').classList.add('active');
        
        // Update the create button to be a save button instead
        elements.createDynamicSlideBtn.textContent = 'Save Changes';
        elements.createDynamicSlideBtn.onclick = () => {
            collectFormData();
            block.dynamicConfig = JSON.parse(JSON.stringify(currentDynamicSlide)); // Deep copy
            closeDynamicSlideModal();
            renderCurrentSlide();
            // Reset the button
            elements.createDynamicSlideBtn.textContent = 'Create Dynamic Slide';
            elements.createDynamicSlideBtn.onclick = createDynamicSlide;
        };
        
        // Show the modal
        elements.dynamicSlideModal.style.display = 'block';
    }

    function promptForVariable() {
        const varName = prompt('Enter variable name (without curly braces):');
        if (varName) {
            insertTextAtCursor(elements.templateContent, `{{${varName}}}`);
        }
    }

    function insertTextAtCursor(textarea, text) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const beforeText = textarea.value.substring(0, startPos);
        const afterText = textarea.value.substring(endPos, textarea.value.length);
        
        textarea.value = beforeText + text + afterText;
        textarea.selectionStart = startPos + text.length;
        textarea.selectionEnd = startPos + text.length;
        textarea.focus();
    }

    function addTemplatePart() {
        const partType = elements.templatePartSelect.value;
        if (!partType) return;
        
        let template = '';
        
        switch (partType) {
            case 'title':
                template = '<h1>{{title}}</h1>\n<h2>{{subtitle}}</h2>';
                break;
            case 'bullet':
                template = '<ul>\n  {{#each items}}\n    <li>{{this}}</li>\n  {{/each}}\n</ul>';
                break;
            case 'chart':
                template = '<div class="chart-container" data-type="{{chartType}}" data-labels="{{chartLabels}}" data-values="{{chartValues}}"></div>';
                break;
            case 'table':
                template = '<table>\n  <thead>\n    <tr>\n      {{#each tableHeaders}}\n        <th>{{this}}</th>\n      {{/each}}\n    </tr>\n  </thead>\n  <tbody>\n    {{#each tableRows}}\n      <tr>\n        {{#each this}}\n          <td>{{this}}</td>\n        {{/each}}\n      </tr>\n    {{/each}}\n  </tbody>\n</table>';
                break;
        }
        
        insertTextAtCursor(elements.templateContent, template);
        elements.templatePartSelect.value = ''; // Reset select
    }

    function addVariablePair() {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'variable-pair';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'Variable name';
        keyInput.className = 'variable-key';
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'Value';
        valueInput.className = 'variable-value';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => {
            elements.variablesContainer.removeChild(pairDiv);
        });
        
        pairDiv.appendChild(keyInput);
        pairDiv.appendChild(valueInput);
        pairDiv.appendChild(deleteBtn);
        
        elements.variablesContainer.appendChild(pairDiv);
    }

    function collectFormData() {
        // Get template
        currentDynamicSlide.template = elements.templateContent.value;
        
        // Get data source
        currentDynamicSlide.dataSource = document.querySelector('input[name="dataSource"]:checked').value;
        
        // Collect variables if using manual data
        if (currentDynamicSlide.dataSource === 'manual') {
            currentDynamicSlide.variables = {};
            document.querySelectorAll('.variable-pair').forEach(pair => {
                const key = pair.querySelector('.variable-key').value.trim();
                const value = pair.querySelector('.variable-value').value.trim();
                if (key) {
                    currentDynamicSlide.variables[key] = value;
                }
            });
        }
        
        // Collect API config
        if (currentDynamicSlide.dataSource === 'api') {
            currentDynamicSlide.apiConfig = {
                url: document.getElementById('apiUrl').value,
                dataPath: document.getElementById('apiDataPath').value,
                updateFrequency: document.getElementById('updateFrequency').value,
                updateInterval: parseInt(document.getElementById('updateInterval').value, 10) || 30
            };
        }
        
        // Collect function code
        if (currentDynamicSlide.dataSource === 'function') {
            currentDynamicSlide.functionCode = document.getElementById('dataFunction').value;
        }
    }

    function updatePreview() {
        collectFormData();
        
        // Get the data based on the source
        let data;
        
        if (currentDynamicSlide.dataSource === 'manual') {
            data = currentDynamicSlide.variables;
        } else if (currentDynamicSlide.dataSource === 'function') {
            try {
                // Create a safe function execution environment
                const functionBody = currentDynamicSlide.functionCode;
                const dataFunction = new Function(functionBody);
                data = dataFunction();
            } catch (error) {
                elements.previewContainer.innerHTML = `<div class="error">Error in function: ${error.message}</div>`;
                return;
            }
        } else if (currentDynamicSlide.dataSource === 'api') {
            // For the preview, just use placeholder data
            elements.previewContainer.innerHTML = '<div class="loading">API data will be fetched during presentation</div>';
            return;
        }
        
        // Render the template with the data
        renderDynamicTemplate(elements.previewContainer, currentDynamicSlide.template, data);
    }

    function renderDynamicTemplate(container, template, data) {
        try {
            // Simple template rendering function
            let html = template;
            
            // Handle {{variable}} replacements
            html = html.replace(/\{\{([^#\/][^}]+)\}\}/g, (match, variable) => {
                const trimmed = variable.trim();
                return data[trimmed] !== undefined ? data[trimmed] : match;
            });
            
            // Handle {{#each array}}...{{/each}}
            html = html.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
                const trimmed = arrayName.trim();
                if (!data[trimmed] || !Array.isArray(data[trimmed])) {
                    return match;
                }
                
                return data[trimmed].map(item => {
                    // Replace {{this}} with the current item
                    return content.replace(/\{\{this\}\}/g, item);
                }).join('');
            });
            
            container.innerHTML = html;
            
            // Handle chart containers if any
            container.querySelectorAll('.chart-container').forEach(chartContainer => {
                // In a real implementation, this would initialize a chart library
                chartContainer.innerHTML = `<div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                    Chart: ${chartContainer.getAttribute('data-type')}<br>
                    Labels: ${chartContainer.getAttribute('data-labels')}<br>
                    Values: ${chartContainer.getAttribute('data-values')}
                </div>`;
            });
        } catch (error) {
            container.innerHTML = `<div class="error">Error rendering template: ${error.message}</div>`;
        }
    }

    async function fetchDataFromApi(config) {
        try {
            const response = await fetch(config.url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const jsonData = await response.json();
            
            // Parse the data path
            if (config.dataPath) {
                const pathParts = config.dataPath.split('.');
                let result = jsonData;
                
                for (const part of pathParts) {
                    if (result[part] !== undefined) {
                        result = result[part];
                    } else {
                        throw new Error(`Path '${config.dataPath}' not found in API response`);
                    }
                }
                
                return result;
            }
            
            return jsonData;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }

    function createDynamicSlide() {
        collectFormData();
        
        // Create a new slide block
        const currentSlide = state.slides[state.currentSlideIndex];
        if (!currentSlide) {
            alert('No current slide to add the dynamic content to');
            return;
        }
        
        const newBlock = {
            id: Date.now(),
            type: 'dynamic',
            dynamicConfig: JSON.parse(JSON.stringify(currentDynamicSlide)), // Deep copy
            content: '' // Will be filled when rendered
        };
        
        currentSlide.content.push(newBlock);
        closeDynamicSlideModal();
        renderCurrentSlide();
    }

    function openDynamicSlideModal() {
        // Reset the modal
        elements.templateContent.value = '';
        elements.variablesContainer.innerHTML = '';
        document.getElementById('apiUrl').value = '';
        document.getElementById('apiDataPath').value = '';
        document.getElementById('updateFrequency').value = 'manual';
        document.getElementById('updateInterval').value = '30';
        document.getElementById('dataFunction').value = currentDynamicSlide.functionCode;
        
        // Show the first tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector('.tab-btn[data-tab="template"]').classList.add('active');
        document.querySelector('.tab-content[data-tab="template"]').classList.add('active');
        
        // Reset the current dynamic slide
        currentDynamicSlide = {
            template: '',
            dataSource: 'manual',
            variables: {},
            apiConfig: {
                url: '',
                dataPath: '',
                updateFrequency: 'manual',
                updateInterval: 30
            },
            functionCode: 'return {\n  title: "Dynamic Title",\n  items: ["Item 1", "Item 2"],\n  value: Math.random() * 100\n};'
        };
        
        // Add a default variable pair
        addVariablePair();
        
        // Show the modal
        elements.dynamicSlideModal.style.display = 'block';
    }

    function closeDynamicSlideModal() {
        elements.dynamicSlideModal.style.display = 'none';
    }

    // Set up tab navigation
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Activate clicked tab
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
            
            // If switching to preview tab, update the preview
            if (tabName === 'preview') {
                updatePreview();
            }
        });
    });

    // Set up data source radio buttons
    document.querySelectorAll('input[name="dataSource"]').forEach(radio => {
        radio.addEventListener('change', () => {
            // Hide all config sections
            document.querySelectorAll('.data-source-config').forEach(config => {
                config.style.display = 'none';
            });
            
            // Show the selected config section
            const selectedValue = document.querySelector('input[name="dataSource"]:checked').value;
            document.getElementById(`${selectedValue}Config`).style.display = 'block';
            
            // Show/hide interval config if needed
            if (selectedValue === 'api') {
                document.getElementById('updateFrequency').addEventListener('change', () => {
                    if (document.getElementById('updateFrequency').value === 'interval') {
                        document.getElementById('intervalConfig').style.display = 'block';
                    } else {
                        document.getElementById('intervalConfig').style.display = 'none';
                    }
                });
            }
        });
    });

    // Current dynamic slide being edited
    let currentDynamicSlide = {
        template: '',
        dataSource: 'manual',
        variables: {},
        apiConfig: {
            url: '',
            dataPath: '',
            updateFrequency: 'manual',
            updateInterval: 30
        },
        functionCode: 'return {\n  title: "Dynamic Title",\n  items: ["Item 1", "Item 2"],\n  value: Math.random() * 100\n};'
    };

    function openAiPresentationModal() {
        // Synchronize API keys
        elements.presentationApiKeyInput.value = elements.apiKeyInput.value || localStorage.getItem('openai_api_key') || '';
        
        // Show the modal
        elements.aiPresentationModal.style.display = 'block';
    }

    function closeAiPresentationModal() {
        elements.aiPresentationModal.style.display = 'none';
        elements.presentationGenerationStatus.className = 'generation-status';
        elements.presentationGenerationStatus.style.display = 'none';
        elements.presentationGenerationStatus.textContent = '';
        elements.generationProgress.style.display = 'none';
    }

    function toggleCustomSlidesCount() {
        if (elements.slidesCountInput.value === 'custom') {
            elements.customSlidesCount.style.display = 'inline-block';
        } else {
            elements.customSlidesCount.style.display = 'none';
        }
    }

    function showPresentationGenerationStatus(message, type) {
        elements.presentationGenerationStatus.textContent = message;
        elements.presentationGenerationStatus.className = `generation-status ${type}`;
        elements.presentationGenerationStatus.style.display = 'block';
    }

    function updateProgressBar(current, total) {
        const percentage = (current / total) * 100;
        elements.progressBarFill.style.width = `${percentage}%`;
        elements.progressText.textContent = `Generating slide ${current} of ${total}...`;
    }

    async function generateAiPresentation() {
        const apiKey = elements.presentationApiKeyInput.value.trim();
        const topic = elements.presentationTopicInput.value.trim();
        
        if (!apiKey) {
            showPresentationGenerationStatus('Please enter your OpenAI API key', 'error');
            return;
        }
        
        if (!topic) {
            showPresentationGenerationStatus('Please enter a presentation topic', 'error');
            return;
        }
        
        // Save API key and synchronize it with the other modal's input
        localStorage.setItem('openai_api_key', apiKey);
        elements.apiKeyInput.value = apiKey;
        
        // Get presentation parameters
        let slidesCount = parseInt(elements.slidesCountInput.value);
        if (elements.slidesCountInput.value === 'custom') {
            slidesCount = parseInt(elements.customSlidesCount.value);
            if (isNaN(slidesCount) || slidesCount < 1 || slidesCount > 20) {
                showPresentationGenerationStatus('Please enter a valid number of slides (1-20)', 'error');
                return;
            }
        }
        
        const style = elements.presentationStyleInput.value;
        const contentBalance = elements.contentBalanceInput.value;
        const includeTitle = elements.includeTitle.checked;
        const includeSummary = elements.includeSummary.checked;
        const includeCode = elements.includeCode.checked;
        const includeImages = elements.includeImages.checked;
        const description = elements.presentationDescriptionInput.value.trim();
        
        // Show loading message and initialize progress bar
        showPresentationGenerationStatus('Planning your presentation...', 'loading');
        elements.generationProgress.style.display = 'block';
        elements.progressBarFill.style.width = '0%';
        elements.progressText.textContent = 'Creating presentation outline...';
        
        try {
            // First, generate an outline for the presentation
            const outlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional presentation designer. You will create an outline for a presentation based on the user\'s requirements. Focus on creating a clear, well-structured presentation.'
                        },
                        {
                            role: 'user',
                            content: `Create an outline for a ${slidesCount}-slide presentation on "${topic}".
                            
Style: ${style}
Content balance: ${contentBalance}
Additional description: ${description}

${includeTitle ? 'Include a title slide.' : ''}
${includeSummary ? 'Include a summary/conclusion slide.' : ''}
${includeCode ? 'Include code examples where appropriate.' : ''}
${includeImages ? 'Suggest image concepts where appropriate.' : ''}

Create an outline with a title and brief content description for each slide. Format your response as JSON with the following structure:
{
  "title": "Main Presentation Title",
  "slides": [
    {
      "title": "Slide 1 Title",
      "type": "title|content|code|image|summary",
      "content": "Brief description of what should be in this slide"
    },
    ...
  ]
}`
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            if (!outlineResponse.ok) {
                const error = await outlineResponse.json();
                throw new Error(error.error.message || 'Error connecting to OpenAI API');
            }
            
            const outlineData = await outlineResponse.json();
            let outlineText = outlineData.choices[0].message.content.trim();
            
            // Extract JSON from the response
            const jsonMatch = outlineText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse outline response from AI');
            }
            
            const outlineJson = JSON.parse(jsonMatch[0]);
            showPresentationGenerationStatus('Creating slides based on outline...', 'loading');
            
            // Clear existing slides if any
            while (state.slides.length > 0) {
                state.slides.pop();
            }
            
            // Generate each slide
            for (let i = 0; i < outlineJson.slides.length; i++) {
                const slideOutline = outlineJson.slides[i];
                updateProgressBar(i + 1, outlineJson.slides.length);
                
                // Create a new slide
                const newSlide = {
                    id: Date.now() + i,
                    content: []
                };
                
                // Generate content for this slide
                const slideContent = await generateSlideContent(apiKey, topic, slideOutline, style, includeCode, includeImages);
                
                // Add title block
                const titleBlock = {
                    id: Date.now() + i * 100,
                    type: 'text',
                    content: `<h2>${slideOutline.title}</h2>`
                };
                newSlide.content.push(titleBlock);
                
                // Add main content blocks
                if (slideContent.mainText) {
                    const textBlock = {
                        id: Date.now() + i * 100 + 1,
                        type: 'text',
                        content: slideContent.mainText
                    };
                    newSlide.content.push(textBlock);
                }
                
                // Add code block if present
                if (slideContent.code) {
                    const codeBlock = {
                        id: Date.now() + i * 100 + 2,
                        type: 'code',
                        language: slideContent.codeLanguage || 'javascript',
                        content: slideContent.code
                    };
                    newSlide.content.push(codeBlock);
                }
                
                // Add the slide to the presentation
                state.slides.push(newSlide);
            }
            
            // Set the current slide to the first one
            state.currentSlideIndex = 0;
            renderSlides();
            
            // Show success message
            showPresentationGenerationStatus('Presentation generated successfully!', 'success');
            setTimeout(() => {
                closeAiPresentationModal();
            }, 2000);
            
        } catch (error) {
            console.error('Error generating presentation:', error);
            showPresentationGenerationStatus(`Error: ${error.message}`, 'error');
            elements.generationProgress.style.display = 'none';
        }
    }

    async function generateSlideContent(apiKey, topic, slideOutline, style, includeCode, includeImages) {
        // Generate detailed content for a single slide
        const slideType = slideOutline.type || 'content';
        const slideTitle = slideOutline.title;
        const slideContentDesc = slideOutline.content;
        
        const slideResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional presentation content creator. Create detailed slide content based on the outline.'
                    },
                    {
                        role: 'user',
                        content: `Create detailed content for a slide in a ${style} presentation about "${topic}".

Slide title: "${slideTitle}"
Slide type: ${slideType}
Content description: ${slideContentDesc}

${slideType === 'code' || includeCode && slideContentDesc.toLowerCase().includes('code') ? 
  'Include appropriate code examples. Format code examples so they can be used directly in a presentation.' : ''}
${includeImages && (slideType === 'image' || slideContentDesc.toLowerCase().includes('image')) ? 
  'Suggest image concepts where appropriate.' : ''}

Format your response as JSON with the following structure:
{
  "mainText": "The main text content with HTML formatting (paragraphs, lists, etc.)",
  "code": "Include any code examples here or null if none",
  "codeLanguage": "The programming language of the code or null",
  "imageDescriptions": ["Short description of suggested images or empty array"]
}`
                    }
                ],
                temperature: 0.7
            })
        });
        
        if (!slideResponse.ok) {
            const error = await slideResponse.json();
            throw new Error(error.error.message || 'Error generating slide content');
        }
        
        const slideData = await slideResponse.json();
        let slideResponseText = slideData.choices[0].message.content.trim();
        
        // Extract JSON from the response
        const jsonMatch = slideResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            // If we can't parse JSON, just use the text as-is
            return {
                mainText: slideResponseText,
                code: null,
                codeLanguage: null,
                imageDescriptions: []
            };
        }
        
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // If JSON parsing fails, use the text as-is
            return {
                mainText: slideResponseText,
                code: null,
                codeLanguage: null,
                imageDescriptions: []
            };
        }
    }
}); 