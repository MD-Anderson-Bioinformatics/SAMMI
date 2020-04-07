#sammiJSON function write to the fname JSON file a SAMMI compatible version of the COBRA model
def sammiJson (model,fname = 'SAMMI.json'):
    #Get reaction fields to include
    rxnfields = []
    for f in dir(model.reactions[0]):
        try:
            if isinstance(getattr(model.reactions[0],f),(str,bool,float,int)) and not f.startswith('_') and not f == 'id':
                rxnfields.append(f)
        except:
            pass

    #Get metabolite fields to include
    metfields = []
    for f in dir(model.metabolites[0]):
        try:
            if isinstance(getattr(model.metabolites[0],f),(str,bool,float,int)) and not f.startswith('_') and not f == 'id':
                metfields.append(f)
        except:
            pass

    #make metabolite fields
    fd = ['{"id":"' + f.id + '",' for f in model.metabolites]
    sep = ','
    for f in metfields:
        if isinstance(getattr(model.metabolites[0],f),str):
            fd = [x + '"' + f + '":"' + y + '"' + sep for x,y in zip(fd,[getattr(g,f) for g in model.metabolites])]
        elif isinstance(getattr(model.metabolites[0],f),bool):
            fd = [x + '"' + f + '":' + y + sep for x,y in zip(fd,[str(getattr(g,f)).lower() for g in model.metabolites])]
        else:
            fd = [x + '"' + f + '":' + y + sep for x,y in zip(fd,[str(getattr(g,f)) for g in model.metabolites])]
        if metfields.index(f) == len(metfields)-2:
            sep = '}'

    #Make JSON string
    jsonstr = '{"metabolites":[' + ','.join(fd) + '],"reactions":['

    #make reaction fields
    fd = ['{"id":"' + f.id + '",' for f in model.reactions]
    for f in rxnfields:
        if isinstance(getattr(model.reactions[0],f),str):
            fd = [x + '"' + f + '":"' + y + '",' for x,y in zip(fd,[getattr(g,f) for g in model.reactions])]
        elif isinstance(getattr(model.reactions[0],f),bool):
            fd = [x + '"' + f + '":' + y + ',' for x,y in zip(fd,[str(getattr(g,f)).lower() for g in model.reactions])]
        else:
            fd = [x + '"' + f + '":' + y + ',' for x,y in zip(fd,[str(getattr(g,f)) for g in model.reactions])]

    #Make metabolites fields
    metarr = [','.join(['"' + str(x) + '":' + str(y) for x,y in zip(z.metabolites.keys(),z.metabolites.values())]) for z in model.reactions ]
    fd = ','.join([x + '"metabolites":{' + y + '}}' for x,y, in zip(fd,metarr)])

    #Finalize JSON string
    jsonstr = jsonstr + fd + ']}'
    
    #Write to file
    f = open(fname, "w")
    f.write(jsonstr)