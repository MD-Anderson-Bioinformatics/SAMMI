Examples
==============

Here we provide several simple examples for the use of SAMMIM. Each example is supposed to be more complex than the next, and is intended to exemplify as many different functionalities of SAMMIM as possible. To get started, install the COBRA toolbox as described in the documentation `here
<https://opencobra.github.io/cobratoolbox/stable/installation.html>`_. The examples described here are available through SAMMIM in the :code:`testSammi` function. To view the code for each example in MATLAB type :code:`edit testSammi`. To run each example run :code:`testSammi(n)` where :code:`n` ranges from zero to eleven, referring to the example number defined here.

Make sure the COBRA toolbox is initialized and load variable to be used throughout these examples:

.. code-block:: matlab

    %Initialize toolbox
    initCobraToolbox
    %Get COBRA directory
    global CBTDIR;
    %Get SAMMIM folder
    sammipath = strrep(which('sammi'),'\sammi.m','');

0. Plot entire model
--------------------------
To plot the entire model simply call :code:`sammi` on the COBRA model. This is not advisable for medium to large models as the visualization may be too large to render.

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Plot
    sammi(model)

1-2. Divide the model into subgraphs using model annotation
--------------------------------------------------------------------
1. Maps can be divided into subgraphs using model annotation. For instance, users can plot a subgraph for each annotated reaction subsystem:

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/Recon2.v04.mat'])
    %Plot a subgraph for each subsystem
    sammi(modelR204,'subSystems')

2. Or plot a map for each cellular compartment:

.. code-block:: matlab

    %Get sample model to plot
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat']);
    %Make compartment vector
    comp = regexp(model.mets,'\[(.)\]$','tokens');
    comp = vertcat(comp{:});
    model.compartment = vertcat(comp{:});
    %Plot
    sammi(model,'compartment')

3. Plot and visualize multiple maps
-------------------------------------------------
By default, SAMMI outputs the visualization to a file names :code:`index.load.html` in the package folder. Therefore, by default, every time a new visualization is generated this file is overwritten. The name of the output file can be changed, however, in order to not overwrite files. For instance:

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Initialize options
    options.load = false;
    %Plot whole model in default file
    sammi(model,[],[],[],options)
    %Modify options to render map in different file
    options.htmlName = 'index_load2.html';
    %Plot model parsed by subsystem
    sammi(model,'subSystems',[],[],options)
    %Open both visualizations
    openSammi('index_load.html')
    openSammi('index_load2.html')

4. Plot only user-defined reactions
------------------------------------------------
For a quick visualization of a given group of reactions users can plot only certain reactions in a single graph.

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Get reactions to plot
    tca = {'ACONTa','ACONTb','AKGDH','CS','FUM','ICDHyr','MDH','SUCOAS'};
    gly = {'ENO','FBA','FBP','GAPD','PDH','PFK','PGI','PGK','PGM','PPS','PYK','TPI'};
    ppp = {'G6PDH2r','GND','PGL','RPE','RPI','TALA','TKT1','TKT2'};
    dat = cat(2,tca,gly,ppp);
    %Plot only desired reactions
    sammi(model,dat);

5. Shelve secondary metabolites on load
-------------------------------------------------
In order to shelve secondary metabolites upon rendering the model, define the :code:`secondaries` input to the plot function. If this argument is defined, any metabolite, matching any of the defined regular expressions, will be shelved. These metabolites can be returned to the graph using the floating menu window.

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Get reactions to plot
    tca = {'ACONTa','ACONTb','AKGDH','CS','FUM','ICDHyr','MDH','SUCOAS'};
    gly = {'ENO','FBA','FBP','GAPD','PDH','PFK','PGI','PGK','PGM','PPS','PYK','TPI'};
    ppp = {'G6PDH2r','GND','PGL','RPE','RPI','TALA','TKT1','TKT2'};
    dat = cat(2,tca,gly,ppp);
    %Define secondaries
    secondaries = {'^h\[.\]$','^h2o\[.\]$','^o2\[.\]$','^co2\[.\]$',...
        '^atp\[.\]$','^adp\[.\]$','^pi\[.\]$',...
        '^nadh\[.\]$','^nadph\[.\]$','^nad\[.\]$','^nadp\[.\]$'};
    %Plot only desired reactions
    sammi(model,dat,[],secondaries);

6. Plot multiple user-defined subgraphs
-----------------------------------------------
Users can also plot multiple subgraphs with their defined reactions. To do so, define the Parser structured array for each subgraph:

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Get reactions to plot
    dat(1).name = 'TCA Cycle';
    dat(1).rxns = {'ACONTa';'ACONTb';'AKGDH';'CS';'FUM';'ICDHyr';'MDH';'SUCOAS'};
    dat(2).name = 'Glycolysis';
    dat(2).rxns = {'ENO';'FBA';'FBP';'GAPD';'PDH';'PFK';'PGI';'PGK';'PGM';'PPS';'PYK';'TPI'};
    dat(3).name = 'Pentose Phosphate Pathway';
    dat(3).rxns = {'G6PDH2r';'GND';'PGL';'RPE';'RPI';'TALA';'TKT1';'TKT2'};
    %Plot only desired reactions
    sammi(model,dat);

7-8. Data mapping
----------------------------
7. Add data to plotted subgraphs. In this example we are generating random data and mapping it onto the desired reactions. Using the Parser structured array users can directly map data as reaction colors:

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Get reactions to plot
    dat(1).name = 'TCA Cycle';
    dat(1).rxns = {'ACONTa';'ACONTb';'AKGDH';'CS';'FUM';'ICDHyr';'MDH';'SUCOAS'};
    dat(2).name = 'Glycolysis';
    dat(2).rxns = {'ENO';'FBA';'FBP';'GAPD';'PDH';'PFK';'PGI';'PGK';'PGM';'PPS';'PYK';'TPI'};
    dat(3).name = 'Pentose Phosphate Pathway';
    dat(3).rxns = {'G6PDH2r';'GND';'PGL';'RPE';'RPI';'TALA';'TKT1';'TKT2'};
    %Add random flux
    for i = 1:3; dat(i).flux = randn(length(dat(i).rxns),1); end
    %Plot only desired reactions
    sammi(model,dat);

8. Alternatively, users can map data onto the map using the Data structured array. The following example maps five sets of random data, each in a different way, with five conditions each.

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Define number of conditions
    n = 5;
    %Make reaction table with random data
    rxntbl = randn(length(model.rxns),n);
    rxntbl(randsample(length(model.rxns)*n,floor(n*length(model.rxns)/10))) = NaN;
    rxntbl = array2table(rxntbl,'VariableNames',sprintfc('condition_%d',1:n),...
        'RowNames',model.rxns);
    %Make metabolites table with random data
    mettbl = randn(length(model.mets),n);
    mettbl(randsample(length(model.mets)*n,floor(0.5*length(model.mets)))) = NaN;
    mettbl = array2table(mettbl,'VariableNames',sprintfc('condition_%d',1:n),...
        'RowNames',model.mets);
    %Make struct
    dat(1).type = {'rxns' 'color'};
    dat(1).data = rxntbl;
    dat(2).type = {'rxns' 'size'};
    dat(2).data = rxntbl;
    dat(3).type = {'mets' 'color'};
    dat(3).data = mettbl;
    dat(4).type = {'mets' 'size'};
    dat(4).data = mettbl;
    dat(5).type = {'links' 'size'};
    dat(5).data = rxntbl;
    %Define secondaries
    secondaries = {'^h\[.\]$','^h20\[.\]$','^o2\[.\]$','^co2\[.\]$',...
        '^atp\[.\]$','^adp\[.\]$','^pi\[.\]$',...
        '^nadh\[.\]$','^nadph\[.\]$','^nad\[.\]$','^nadp\[.\]$'};
    %Plot dividing up by subsystems
    sammi(model,'subSystems',dat,secondaries)

9. Change map upon load
-----------------------------------
SAMMI options also allow users to change visualization parameters upon loading the model. This can be done by adding JavaScript code to the end of the visualization. To use this advanced feature users need to be familiar with JavaScript and need to familiarize themselves with the SAMMI visualization html layout. The following code loads the previous map, changes the visualization to the Citric Acid Cycle subgraph, and changes the colorscale upon loading.

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Define number of conditions
    n = 5;
    %Make reaction table with random data
    rxntbl = randn(length(model.rxns),n);
    rxntbl(randsample(length(model.rxns)*n,floor(n*length(model.rxns)/10))) = NaN;
    rxntbl = array2table(rxntbl,'VariableNames',sprintfc('condition_%d',1:n),...
        'RowNames',model.rxns);
    %Make struct
    dat(1).type = {'rxns' 'color'};
    dat(1).data = rxntbl;
    %Define secondaries
    secondaries = {'^h\[.\]$','^h20\[.\]$','^o2\[.\]$','^co2\[.\]$',...
        '^atp\[.\]$','^adp\[.\]$','^pi\[.\]$',...
        '^nadh\[.\]$','^nadph\[.\]$','^nad\[.\]$','^nadp\[.\]$'};
    %Define Javascript code
    jscode = ['x = document.getElementById("onloadf1");' ...
        'x.value = "Citric Acid Cycle";' ...
        'onLoadSwitch(x);' ...
        'document.getElementById("fluxmin").valueAsNumber = -0.1;' ...
        'document.getElementById("fluxmax").valueAsNumber = 0.1;' ...
        'fluxmin = -0.1; fluxmax = 0.1;' ...
        'document.getElementById("edgemin").value = "#ff0000";' ...
        'document.getElementById("edgemax").value = "#0000ff";' ...
        'document.getElementById("addrxnbreak").click();' ...
        'document.getElementsByClassName("rxnbreakval")[0].value = 0;' ...
        'document.getElementsByClassName("rxnbreakcol")[0].value = "#c0c0c0";' ...
        'defineFluxColorVectors();'];
    %Define options
    options.jscode = jscode;
    %Plot dividing up by subsystems
    sammi(model,'subSystems',dat,secondaries,options)

10. Load Existing Map
---------------------------
SAMMI makes it easy for users to share curated maps through the SAMMI Json export. To load existing maps, pass the file path to the :code:`parser` argument. The following example load a map included with the SAMMIM folder:

.. code-block:: matlab

    %Load model
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Define zooming option
    options.jscode = 'zoom.transform(gMain, d3.zoomIdentity.translate(-1149,-863).scale(2.64));';
    %Load existing model
    sammi(model,[sammipath '\demo.json'],[],[],options)

11. Type-III Pathways
----------------------------
Type-III pathways are thermodynamically infeasible, flux-balanced distributions that do not include exchange reactions. In this example we use SAMMI to visualize type-III pathways in the iJO1366 model. We first block all exchange reactions, then perform FVA to determine which reactions remain active. We then loop through the active reactions using FBA to determine loops where they are active.

.. code-block:: matlab

    %Load and tailor model
    load([CBTDIR '/test/models/mat/iJO1366.mat'])
    model = iJO1366;
    model = changeRxnBounds(model,model.rxns(findExcRxns(model)),0,'b');
    model = changeRxnBounds(model,'ATPM',0,'l');
    model.csense = repmat('E',length(model.mets),1);
    model.c = model.c*0;

    %Do FVA
    [fluxmin,fluxmax] = fastFVA(model,0);
    %Clear numerical error
    fluxmax(fluxmax < 1e-7) = 0;
    fluxmin(fluxmin < -1e-7) = 0;
    
    %Parse
    count = 0;
    %For each positive flux
    for id = find(fluxmax)'
        %Set as objective
        model = changeObjective(model,model.rxns{id},1);
        %Calculate fluxes
        flux = optimizeCbModel(model,'max','one');
        %Clear numerical error
        flux.x(abs(flux.x) < 1e-7) = 0;
        %Save results for plot
        count = count+1;
        ind = find(flux.x);
        dat(count).name = num2str(count);
        dat(count).rxns = model.rxns(ind);
        dat(count).flux = flux.x(ind);
    end
    %For each negative flux
    for id = find(fluxmin)'
        %Set as objective
        model = changeObjective(model,model.rxns{id},1);
        %Calculate fluxes
        flux = optimizeCbModel(model,'min','one');
        %Clear numerical error
        flux.x(abs(flux.x) < 1e-7) = 0;
        %Save results for plot
        count = count+1;
        ind = find(flux.x);
        dat(count).name = num2str(count);
        dat(count).rxns = model.rxns(ind);
        dat(count).flux = flux.x(ind);
    end
    %Plot
    sammi(model,dat)