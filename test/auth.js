const depends = [{
    "release": "A",
    "children": [
        {
            "release": "A1",
            "children": [{
                "release": "B1",
                "children": []
            },
                {
                    "release": "B2",
                    "children": []
                }
            ]
        },
        {
            "release": "A2",
            "children": [{
                "release": "B1",
                "children": []
            }, {
                "release": "B4",
                "children": [{
                    "release": "A1",
                    "children": [{
                        "release": "B1",
                        "children": []
                    },
                        {
                            "release": "B2",
                            "children": []
                        }
                    ]
                }]
            }]
        }
    ]
}]

const authTrees = [
    {
        "release": "A",
        "contractId": true,
        "children": [
            {
                "release": "A1",
                "contractId": true,
                "children": [
                    {
                        "release": "B2",
                        "contractId": true
                    }
                ]
            },
            {
                "release": "A2",
                "contractId": true,
                "children": [
                    {
                        "release": "B4",
                        "contractId": true,
                        "children": [
                            {
                                "release": "A1",
                                "contractId": true,
                            },
                            {
                                "release": "B1",
                                "contractId": false,
                            },
                            {
                                "release": "B2",
                                "contractId": false,
                            }
                        ]
                    }
                ]
            },
            {
                "release": "B1",
                "contractId": true,
            }
        ]
    }
]

function recursion(array, result = [], deep = 0) {
    array.forEach(item => {
        item.deep = deep
        result.push({release: item.release, contractId: item.contractId, deep})
        if (item.children && item.children.length) {
            recursion(item.children, result, deep + 1)
        }
    })
    return result
}

const result = recursion(authTrees)

console.log(JSON.stringify(result))
