'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">tmp documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/ActionModule.html" data-type="entity-link" >ActionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' : 'data-bs-target="#xs-controllers-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' :
                                            'id="xs-controllers-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' }>
                                            <li class="link">
                                                <a href="controllers/ActionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' : 'data-bs-target="#xs-injectables-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' :
                                        'id="xs-injectables-links-module-ActionModule-a9a45f3c81bf150b48ee2c571547ce9c31a4fd9e02d3b90f0a8532d8227e9ddee38564c0ba6b755995cd1c06ef8a57124efb48e214450c40cc1eae3bbb8275fe"' }>
                                        <li class="link">
                                            <a href="injectables/ActionRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActionRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ActionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ArrivalModule.html" data-type="entity-link" >ArrivalModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' : 'data-bs-target="#xs-controllers-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' :
                                            'id="xs-controllers-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' }>
                                            <li class="link">
                                                <a href="controllers/ArrivalController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArrivalController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' : 'data-bs-target="#xs-injectables-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' :
                                        'id="xs-injectables-links-module-ArrivalModule-ba8886d9b1b02752f78e194243be8b140e501db040c593b126a16876f187b4fb25b1bc44f9a2cb0d41f35595da5415f8337890456c61a3226d84584066c98b32"' }>
                                        <li class="link">
                                            <a href="injectables/ArrivalRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArrivalRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ArrivalService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArrivalService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' :
                                            'id="xs-controllers-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' :
                                        'id="xs-injectables-links-module-AuthModule-a3a08d3342b3d9c15c133e6a651544bdb0d5ae7331ec125e5c1864f2050f2b97aace2e9c3bbdad3ccecaae005ede8bfa09ebb568d45f1216090fac8c4329db15"' }>
                                        <li class="link">
                                            <a href="injectables/AuthRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JsonWebTokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JsonWebTokenService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BotModule.html" data-type="entity-link" >BotModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BotModule-67c2a2f1c99b1960018c94c09ec22efc9074b6c849765cb3f5f249e913bbe31b937cefab54975025421718b71d63af24950dd052856ccf2884b7da5a735005d6"' : 'data-bs-target="#xs-injectables-links-module-BotModule-67c2a2f1c99b1960018c94c09ec22efc9074b6c849765cb3f5f249e913bbe31b937cefab54975025421718b71d63af24950dd052856ccf2884b7da5a735005d6"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BotModule-67c2a2f1c99b1960018c94c09ec22efc9074b6c849765cb3f5f249e913bbe31b937cefab54975025421718b71d63af24950dd052856ccf2884b7da5a735005d6"' :
                                        'id="xs-injectables-links-module-BotModule-67c2a2f1c99b1960018c94c09ec22efc9074b6c849765cb3f5f249e913bbe31b937cefab54975025421718b71d63af24950dd052856ccf2884b7da5a735005d6"' }>
                                        <li class="link">
                                            <a href="injectables/BotService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BotService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BotUpdate.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BotUpdate</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ClientModule.html" data-type="entity-link" >ClientModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' : 'data-bs-target="#xs-controllers-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' :
                                            'id="xs-controllers-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' }>
                                            <li class="link">
                                                <a href="controllers/ClientController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' : 'data-bs-target="#xs-injectables-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' :
                                        'id="xs-injectables-links-module-ClientModule-7e1c5fa215609d963d8c154f264f4a2f5c0e7ca8cbdeaf27a6ac348a7cd9637f4430fd21fc05a58006011815edba0151a908f1991456051578b19046b8e40188"' }>
                                        <li class="link">
                                            <a href="injectables/ClientRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ClientService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ClientPaymentModule.html" data-type="entity-link" >ClientPaymentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' : 'data-bs-target="#xs-controllers-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' :
                                            'id="xs-controllers-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' }>
                                            <li class="link">
                                                <a href="controllers/ClientPaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientPaymentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' : 'data-bs-target="#xs-injectables-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' :
                                        'id="xs-injectables-links-module-ClientPaymentModule-f92fbe8ac1eded8f39dd4381645a48fe7b93f21adf024fdcdf3ba9bdb269fcb74c8c96b196132f8fa73657820e9d520ef6eece532ecfebe4475deb2fe5482659"' }>
                                        <li class="link">
                                            <a href="injectables/ClientPaymentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientPaymentRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ClientPaymentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientPaymentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CommonModule.html" data-type="entity-link" >CommonModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' : 'data-bs-target="#xs-controllers-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' :
                                            'id="xs-controllers-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' }>
                                            <li class="link">
                                                <a href="controllers/CommonController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommonController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' : 'data-bs-target="#xs-injectables-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' :
                                        'id="xs-injectables-links-module-CommonModule-a8178ea82b28daa7900d5fe425274fea6f73266c2f22274f0d216a42222ae793558faa234e50836720eb883a66032985bb8ea221391847d165c6323d1dd06ffb"' }>
                                        <li class="link">
                                            <a href="injectables/CommonRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommonRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CommonService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommonService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CronModule.html" data-type="entity-link" >CronModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CronModule-486aaa355994e77075c7a7c9c78f19f90a63f3d4cafca140f5051a5fdedf944aa7bf2c10bb3a73c7e0b675c8dc430b1ab1322e82a88361e25ec9f50332638407"' : 'data-bs-target="#xs-injectables-links-module-CronModule-486aaa355994e77075c7a7c9c78f19f90a63f3d4cafca140f5051a5fdedf944aa7bf2c10bb3a73c7e0b675c8dc430b1ab1322e82a88361e25ec9f50332638407"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CronModule-486aaa355994e77075c7a7c9c78f19f90a63f3d4cafca140f5051a5fdedf944aa7bf2c10bb3a73c7e0b675c8dc430b1ab1322e82a88361e25ec9f50332638407"' :
                                        'id="xs-injectables-links-module-CronModule-486aaa355994e77075c7a7c9c78f19f90a63f3d4cafca140f5051a5fdedf944aa7bf2c10bb3a73c7e0b675c8dc430b1ab1322e82a88361e25ec9f50332638407"' }>
                                        <li class="link">
                                            <a href="injectables/CronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExcelModule.html" data-type="entity-link" >ExcelModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExcelModule-d78fa6142d393675af2f5bc4372d07d5e82d7e85da7f43465978652d6b952cb74b31d16fc6ec0b4d21e855702009aed1f212bed86d410f7e3d3c38ce5ae0e006"' : 'data-bs-target="#xs-injectables-links-module-ExcelModule-d78fa6142d393675af2f5bc4372d07d5e82d7e85da7f43465978652d6b952cb74b31d16fc6ec0b4d21e855702009aed1f212bed86d410f7e3d3c38ce5ae0e006"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExcelModule-d78fa6142d393675af2f5bc4372d07d5e82d7e85da7f43465978652d6b952cb74b31d16fc6ec0b4d21e855702009aed1f212bed86d410f7e3d3c38ce5ae0e006"' :
                                        'id="xs-injectables-links-module-ExcelModule-d78fa6142d393675af2f5bc4372d07d5e82d7e85da7f43465978652d6b952cb74b31d16fc6ec0b4d21e855702009aed1f212bed86d410f7e3d3c38ce5ae0e006"' }>
                                        <li class="link">
                                            <a href="injectables/ExcelService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExcelService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PdfModule.html" data-type="entity-link" >PdfModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PdfModule-62d6d7e9d327db733f1a7a0b5e8ab7f4d144dfc0eae33919da978b8cae2c13162b9e4f9416ec9ea8862b86e4f4b5b363f59b1700c5ec55fa44716d1da11bf572"' : 'data-bs-target="#xs-injectables-links-module-PdfModule-62d6d7e9d327db733f1a7a0b5e8ab7f4d144dfc0eae33919da978b8cae2c13162b9e4f9416ec9ea8862b86e4f4b5b363f59b1700c5ec55fa44716d1da11bf572"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PdfModule-62d6d7e9d327db733f1a7a0b5e8ab7f4d144dfc0eae33919da978b8cae2c13162b9e4f9416ec9ea8862b86e4f4b5b363f59b1700c5ec55fa44716d1da11bf572"' :
                                        'id="xs-injectables-links-module-PdfModule-62d6d7e9d327db733f1a7a0b5e8ab7f4d144dfc0eae33919da978b8cae2c13162b9e4f9416ec9ea8862b86e4f4b5b363f59b1700c5ec55fa44716d1da11bf572"' }>
                                        <li class="link">
                                            <a href="injectables/PdfService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PdfService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PermissionModule.html" data-type="entity-link" >PermissionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' : 'data-bs-target="#xs-controllers-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' :
                                            'id="xs-controllers-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' }>
                                            <li class="link">
                                                <a href="controllers/PermissionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' : 'data-bs-target="#xs-injectables-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' :
                                        'id="xs-injectables-links-module-PermissionModule-f7d745132fa60f18db423a510756f357cc13c55145db5ddaff9e77bee335f7b37f5345cb44ac7972aa0669bce2611297b1659e0ca69189bfebe5b01c17cb72c3"' }>
                                        <li class="link">
                                            <a href="injectables/PermissionRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PermissionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-4a38e74ed4c6991214f9ed11f431688c2d12e1e4b427dc7902daca85369d1fa7cad445571c8d15c06265a281a61d369106f15f4c7635708be994e699756ff0c5"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-4a38e74ed4c6991214f9ed11f431688c2d12e1e4b427dc7902daca85369d1fa7cad445571c8d15c06265a281a61d369106f15f4c7635708be994e699756ff0c5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-4a38e74ed4c6991214f9ed11f431688c2d12e1e4b427dc7902daca85369d1fa7cad445571c8d15c06265a281a61d369106f15f4c7635708be994e699756ff0c5"' :
                                        'id="xs-injectables-links-module-PrismaModule-4a38e74ed4c6991214f9ed11f431688c2d12e1e4b427dc7902daca85369d1fa7cad445571c8d15c06265a281a61d369106f15f4c7635708be994e699756ff0c5"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProductModule.html" data-type="entity-link" >ProductModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' : 'data-bs-target="#xs-controllers-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' :
                                            'id="xs-controllers-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' }>
                                            <li class="link">
                                                <a href="controllers/ProductController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' : 'data-bs-target="#xs-injectables-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' :
                                        'id="xs-injectables-links-module-ProductModule-1211ac16043576e90af942378db81c32f7d9d9e90fde0f1243bd1e7e1c38041104982ae8565cf0eb614128c3a8ae6a3e866619d02fae46989dd4135312480f08"' }>
                                        <li class="link">
                                            <a href="injectables/ProductRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProductService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProductMVModule.html" data-type="entity-link" >ProductMVModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' : 'data-bs-target="#xs-controllers-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' :
                                            'id="xs-controllers-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' }>
                                            <li class="link">
                                                <a href="controllers/ProductMVController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductMVController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' : 'data-bs-target="#xs-injectables-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' :
                                        'id="xs-injectables-links-module-ProductMVModule-3bf9fe3b6b0d8369789d6ab89799e10af6616329cff2808a3af821b16579331931f3f7d3c0d059fdbbb9383d1055a0c42605233d188f482a16f8036cf48c471c"' }>
                                        <li class="link">
                                            <a href="injectables/ProductMVRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductMVRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProductMVService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductMVService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ReturningModule.html" data-type="entity-link" >ReturningModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' : 'data-bs-target="#xs-controllers-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' :
                                            'id="xs-controllers-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' }>
                                            <li class="link">
                                                <a href="controllers/ReturningController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReturningController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' : 'data-bs-target="#xs-injectables-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' :
                                        'id="xs-injectables-links-module-ReturningModule-97e8ed8957eb4a584e589dd2e0c2c35123c896e3e292b4a465328c172bceeb850026ac55e2f5acb0586d3b170e2405a82cffb7f15f659dbd74377371e139f4d7"' }>
                                        <li class="link">
                                            <a href="injectables/ReturningRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReturningRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ReturningService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReturningService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SellingModule.html" data-type="entity-link" >SellingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' : 'data-bs-target="#xs-controllers-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' :
                                            'id="xs-controllers-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' }>
                                            <li class="link">
                                                <a href="controllers/SellingController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SellingController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' : 'data-bs-target="#xs-injectables-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' :
                                        'id="xs-injectables-links-module-SellingModule-fa9a2ebc52d97e1580390d43d9a1443f8abe345d03e3654a8311ea35555c415a7de541683d278e68e6e9cf35aad5f9de4c1d1e46b2d35f3bf3e630a0b68eefb2"' }>
                                        <li class="link">
                                            <a href="injectables/SellingRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SellingRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SellingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SellingService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StaffModule.html" data-type="entity-link" >StaffModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' : 'data-bs-target="#xs-controllers-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' :
                                            'id="xs-controllers-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' }>
                                            <li class="link">
                                                <a href="controllers/StaffController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' : 'data-bs-target="#xs-injectables-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' :
                                        'id="xs-injectables-links-module-StaffModule-f184bf396b9362bfa6ccf06b5a60799621efc37a8f6af058ee5c955ecaf2bf2bc5a43ef40a1a6ca11b6a5865cf780b27b8b40a702d2f1fce15bf559e078dd6ac"' }>
                                        <li class="link">
                                            <a href="injectables/StaffRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StaffService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StaffPaymentModule.html" data-type="entity-link" >StaffPaymentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' : 'data-bs-target="#xs-controllers-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' :
                                            'id="xs-controllers-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' }>
                                            <li class="link">
                                                <a href="controllers/StaffPaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffPaymentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' : 'data-bs-target="#xs-injectables-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' :
                                        'id="xs-injectables-links-module-StaffPaymentModule-832d99640fc3c19125f86122c56439be1faa01723b0c8c65e0534909625708be7f384918a0ecb97b6fc0914721faa9b2450278a048eba70ef17685bb3d914f63"' }>
                                        <li class="link">
                                            <a href="injectables/StaffPaymentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffPaymentRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StaffPaymentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StaffPaymentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SupplierModule.html" data-type="entity-link" >SupplierModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' : 'data-bs-target="#xs-controllers-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' :
                                            'id="xs-controllers-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' }>
                                            <li class="link">
                                                <a href="controllers/SupplierController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' : 'data-bs-target="#xs-injectables-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' :
                                        'id="xs-injectables-links-module-SupplierModule-cd9436bb287e689e1c9fc3b75c20eaa5de2fc93cb5d7785a16810a6e985befcb0c7dc30aab974f82998204a7f75bab65e5ac2a8ff7b248b8b75afbc54cfeeccf"' }>
                                        <li class="link">
                                            <a href="injectables/SupplierRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SupplierService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SupplierPaymentModule.html" data-type="entity-link" >SupplierPaymentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' : 'data-bs-target="#xs-controllers-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' :
                                            'id="xs-controllers-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' }>
                                            <li class="link">
                                                <a href="controllers/SupplierPaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierPaymentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' : 'data-bs-target="#xs-injectables-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' :
                                        'id="xs-injectables-links-module-SupplierPaymentModule-9988d92689e927b4af6dfd480b1ef7714a5df008fc9ce31e513ab4e5f1db36b6d465dcbca779eee02c378944e4147e12aa252ec4b6a9abe2ef96658fcb879569"' }>
                                        <li class="link">
                                            <a href="injectables/SupplierPaymentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierPaymentRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SupplierPaymentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupplierPaymentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SyncronizeModule.html" data-type="entity-link" >SyncronizeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' : 'data-bs-target="#xs-controllers-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' :
                                            'id="xs-controllers-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' }>
                                            <li class="link">
                                                <a href="controllers/SyncronizeController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SyncronizeController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' : 'data-bs-target="#xs-injectables-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' :
                                        'id="xs-injectables-links-module-SyncronizeModule-c1053df742231e20fcd59fef657166687b2ed57d5c084505bf3eca76593266b6dcb1b8a2e3a7a1e9638eba9cc6a7d5750c6dbdca95622f0d350436fe8224cc23"' }>
                                        <li class="link">
                                            <a href="injectables/Syncronize2Service.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >Syncronize2Service</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SyncronizeRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SyncronizeRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SyncronizeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SyncronizeService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ActionFindManyDataDto.html" data-type="entity-link" >ActionFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionFindManyRequestDto.html" data-type="entity-link" >ActionFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionFindManyResponseDto.html" data-type="entity-link" >ActionFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionFindOneDataDto.html" data-type="entity-link" >ActionFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionFindOneRequestDto.html" data-type="entity-link" >ActionFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionFindOneResponseDto.html" data-type="entity-link" >ActionFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionGetManyRequestDto.html" data-type="entity-link" >ActionGetManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionGetOneRequestDto.html" data-type="entity-link" >ActionGetOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionModifyResponseDto.html" data-type="entity-link" >ActionModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionOptionalDto.html" data-type="entity-link" >ActionOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionRequiredDto.html" data-type="entity-link" >ActionRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActionUpdateOneRequestDto.html" data-type="entity-link" >ActionUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllExceptionFilter.html" data-type="entity-link" >AllExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalCreateOneRequestDto.html" data-type="entity-link" >ArrivalCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalCreateOneResponseDto.html" data-type="entity-link" >ArrivalCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalDeleteOneRequestDto.html" data-type="entity-link" >ArrivalDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindManyDataDto.html" data-type="entity-link" >ArrivalFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindManyRequestDto.html" data-type="entity-link" >ArrivalFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindManyResponseDto.html" data-type="entity-link" >ArrivalFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindOneDataDto.html" data-type="entity-link" >ArrivalFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindOneRequestDto.html" data-type="entity-link" >ArrivalFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalFindOneResponseDto.html" data-type="entity-link" >ArrivalFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalModifyResponseDto.html" data-type="entity-link" >ArrivalModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalOptionalDto.html" data-type="entity-link" >ArrivalOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalPaymentDto.html" data-type="entity-link" >ArrivalPaymentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalProductDto.html" data-type="entity-link" >ArrivalProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/arrivalProductMVCreateOneRequestDto.html" data-type="entity-link" >arrivalProductMVCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalProductMVUpdateOneRequestDto.html" data-type="entity-link" >ArrivalProductMVUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalRequiredDto.html" data-type="entity-link" >ArrivalRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArrivalUpdateOneRequestDto.html" data-type="entity-link" >ArrivalUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthModifyResponseDto.html" data-type="entity-link" >AuthModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientCreateOneRequestDto.html" data-type="entity-link" >ClientCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientCreateOneResponseDto.html" data-type="entity-link" >ClientCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientDeedDto.html" data-type="entity-link" >ClientDeedDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientDeedInfoDto.html" data-type="entity-link" >ClientDeedInfoDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientDeleteOneRequestDto.html" data-type="entity-link" >ClientDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindManyDataDto.html" data-type="entity-link" >ClientFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindManyRequestDto.html" data-type="entity-link" >ClientFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindManyResponseDto.html" data-type="entity-link" >ClientFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindOneDataDto.html" data-type="entity-link" >ClientFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindOneRequestDto.html" data-type="entity-link" >ClientFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientFindOneResponseDto.html" data-type="entity-link" >ClientFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientModifyResponseDto.html" data-type="entity-link" >ClientModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientOptionalDto.html" data-type="entity-link" >ClientOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentCalcDto.html" data-type="entity-link" >ClientPaymentCalcDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentCreateOneRequestDto.html" data-type="entity-link" >ClientPaymentCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentCreateOneResponseDto.html" data-type="entity-link" >ClientPaymentCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentDeleteOneRequestDto.html" data-type="entity-link" >ClientPaymentDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindManyDataDto.html" data-type="entity-link" >ClientPaymentFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindManyRequestDto.html" data-type="entity-link" >ClientPaymentFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindManyResponseDto.html" data-type="entity-link" >ClientPaymentFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindOneDataDto.html" data-type="entity-link" >ClientPaymentFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindOneRequestDto.html" data-type="entity-link" >ClientPaymentFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentFindOneResponseDto.html" data-type="entity-link" >ClientPaymentFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentModifyResponseDto.html" data-type="entity-link" >ClientPaymentModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentOptionalDto.html" data-type="entity-link" >ClientPaymentOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentRequiredDto.html" data-type="entity-link" >ClientPaymentRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientPaymentUpdateOneRequestDto.html" data-type="entity-link" >ClientPaymentUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientRequiredDto.html" data-type="entity-link" >ClientRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClientUpdateOneRequestDto.html" data-type="entity-link" >ClientUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DebtDto.html" data-type="entity-link" >DebtDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DefaultOptionalFieldsDto.html" data-type="entity-link" >DefaultOptionalFieldsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DefaultRequiredFieldsDto.html" data-type="entity-link" >DefaultRequiredFieldsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlobalModifyResponseDto.html" data-type="entity-link" >GlobalModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlobalResObDefDto.html" data-type="entity-link" >GlobalResObDefDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlobalResponseDto.html" data-type="entity-link" >GlobalResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/IsIntOrBigIntConstraint.html" data-type="entity-link" >IsIntOrBigIntConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationRequestDto.html" data-type="entity-link" >PaginationRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationResponseDto.html" data-type="entity-link" >PaginationResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionCreateOneRequestDto.html" data-type="entity-link" >PermissionCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionDeleteOneRequestDto.html" data-type="entity-link" >PermissionDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindManyDataDto.html" data-type="entity-link" >PermissionFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindManyRequestDto.html" data-type="entity-link" >PermissionFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindManyResponseDto.html" data-type="entity-link" >PermissionFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindOneDataDto.html" data-type="entity-link" >PermissionFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindOneRequestDto.html" data-type="entity-link" >PermissionFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionFindOneResponseDto.html" data-type="entity-link" >PermissionFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionModifyResponseDto.html" data-type="entity-link" >PermissionModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionOptionalDto.html" data-type="entity-link" >PermissionOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionRequiredDto.html" data-type="entity-link" >PermissionRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionUpdateOneRequestDto.html" data-type="entity-link" >PermissionUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductCreateOneRequestDto.html" data-type="entity-link" >ProductCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductDeleteOneRequestDto.html" data-type="entity-link" >ProductDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindManyDataDto.html" data-type="entity-link" >ProductFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindManyRequestDto.html" data-type="entity-link" >ProductFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindManyResponseDto.html" data-type="entity-link" >ProductFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindOneDataDto.html" data-type="entity-link" >ProductFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindOneRequestDto.html" data-type="entity-link" >ProductFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductFindOneResponseDto.html" data-type="entity-link" >ProductFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductModifyResponseDto.html" data-type="entity-link" >ProductModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVDeleteOneRequestDto.html" data-type="entity-link" >ProductMVDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindManyDataDto.html" data-type="entity-link" >ProductMVFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindManyRequestDto.html" data-type="entity-link" >ProductMVFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindManyResponseDto.html" data-type="entity-link" >ProductMVFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindOneDataDto.html" data-type="entity-link" >ProductMVFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindOneRequestDto.html" data-type="entity-link" >ProductMVFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVFindOneResponseDto.html" data-type="entity-link" >ProductMVFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVModifyResponseDto.html" data-type="entity-link" >ProductMVModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVOptionalDto.html" data-type="entity-link" >ProductMVOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductMVRequiredDto.html" data-type="entity-link" >ProductMVRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductOptionalDto.html" data-type="entity-link" >ProductOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductRequiredDto.html" data-type="entity-link" >ProductRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductUpdateOneRequestDto.html" data-type="entity-link" >ProductUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RequestOtherFieldsDto.html" data-type="entity-link" >RequestOtherFieldsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningCreateOneRequestDto.html" data-type="entity-link" >ReturningCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningCreateOneResponseDto.html" data-type="entity-link" >ReturningCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningDeleteOneRequestDto.html" data-type="entity-link" >ReturningDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindManyDataDto.html" data-type="entity-link" >ReturningFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindManyRequestDto.html" data-type="entity-link" >ReturningFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindManyResponseDto.html" data-type="entity-link" >ReturningFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindOneDataDto.html" data-type="entity-link" >ReturningFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindOneRequestDto.html" data-type="entity-link" >ReturningFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningFindOneResponseDto.html" data-type="entity-link" >ReturningFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningModifyResponseDto.html" data-type="entity-link" >ReturningModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningOptionalDto.html" data-type="entity-link" >ReturningOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningPaymentDto.html" data-type="entity-link" >ReturningPaymentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningProductDto.html" data-type="entity-link" >ReturningProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningProductMVCreateOneRequestDto.html" data-type="entity-link" >ReturningProductMVCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningProductMVUpdateOneRequestDto.html" data-type="entity-link" >ReturningProductMVUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningRequiredDto.html" data-type="entity-link" >ReturningRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturningUpdateOneRequestDto.html" data-type="entity-link" >ReturningUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingCalcDto.html" data-type="entity-link" >SellingCalcDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingCreateOneRequestDto.html" data-type="entity-link" >SellingCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingCreateOneResponseDto.html" data-type="entity-link" >SellingCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingDeleteOneRequestDto.html" data-type="entity-link" >SellingDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindManyDataDto.html" data-type="entity-link" >SellingFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindManyRequestDto.html" data-type="entity-link" >SellingFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindManyResponseDto.html" data-type="entity-link" >SellingFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindOneDataDto.html" data-type="entity-link" >SellingFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindOneRequestDto.html" data-type="entity-link" >SellingFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingFindOneResponseDto.html" data-type="entity-link" >SellingFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetPeriodStatsDataDto.html" data-type="entity-link" >SellingGetPeriodStatsDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetPeriodStatsRequestDto.html" data-type="entity-link" >SellingGetPeriodStatsRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetPeriodStatsResponseDto.html" data-type="entity-link" >SellingGetPeriodStatsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetTotalStatsDataDto.html" data-type="entity-link" >SellingGetTotalStatsDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetTotalStatsRequestDto.html" data-type="entity-link" >SellingGetTotalStatsRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingGetTotalStatsResponseDto.html" data-type="entity-link" >SellingGetTotalStatsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingModifyResponseDto.html" data-type="entity-link" >SellingModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingOptionalDto.html" data-type="entity-link" >SellingOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingPaymentDto.html" data-type="entity-link" >SellingPaymentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingProductDto.html" data-type="entity-link" >SellingProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingProductMVCreateOneRequestDto.html" data-type="entity-link" >SellingProductMVCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingProductMVUpdateOneRequestDto.html" data-type="entity-link" >SellingProductMVUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingRequiredDto.html" data-type="entity-link" >SellingRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SellingUpdateOneRequestDto.html" data-type="entity-link" >SellingUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffCreateOneRequestDto.html" data-type="entity-link" >StaffCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffCreateOneResponseDto.html" data-type="entity-link" >StaffCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffDeleteOneRequestDto.html" data-type="entity-link" >StaffDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindManyDataDto.html" data-type="entity-link" >StaffFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindManyRequestDto.html" data-type="entity-link" >StaffFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindManyResponseDto.html" data-type="entity-link" >StaffFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindOneDataDto.html" data-type="entity-link" >StaffFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindOneRequestDto.html" data-type="entity-link" >StaffFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffFindOneResponseDto.html" data-type="entity-link" >StaffFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffModifyResponseDto.html" data-type="entity-link" >StaffModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffOptionalDto.html" data-type="entity-link" >StaffOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentCalcDto.html" data-type="entity-link" >StaffPaymentCalcDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentCreateOneRequestDto.html" data-type="entity-link" >StaffPaymentCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentCreateOneResponseDto.html" data-type="entity-link" >StaffPaymentCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentDeleteOneRequestDto.html" data-type="entity-link" >StaffPaymentDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindManyDataDto.html" data-type="entity-link" >StaffPaymentFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindManyRequestDto.html" data-type="entity-link" >StaffPaymentFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindManyResponseDto.html" data-type="entity-link" >StaffPaymentFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindOneDataDto.html" data-type="entity-link" >StaffPaymentFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindOneRequestDto.html" data-type="entity-link" >StaffPaymentFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentFindOneResponseDto.html" data-type="entity-link" >StaffPaymentFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentModifyResponseDto.html" data-type="entity-link" >StaffPaymentModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentOptionalDto.html" data-type="entity-link" >StaffPaymentOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentRequiredDto.html" data-type="entity-link" >StaffPaymentRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffPaymentUpdateOneRequestDto.html" data-type="entity-link" >StaffPaymentUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffRequiredDto.html" data-type="entity-link" >StaffRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffSignInDataDto.html" data-type="entity-link" >StaffSignInDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffSignInRequestDto.html" data-type="entity-link" >StaffSignInRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffSignInResponseDto.html" data-type="entity-link" >StaffSignInResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StaffUpdateOneRequestDto.html" data-type="entity-link" >StaffUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierCreateOneRequestDto.html" data-type="entity-link" >SupplierCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierCreateOneResponseDto.html" data-type="entity-link" >SupplierCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierDeedDto.html" data-type="entity-link" >SupplierDeedDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierDeedInfoDto.html" data-type="entity-link" >SupplierDeedInfoDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierDeleteOneRequestDto.html" data-type="entity-link" >SupplierDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindManyDataDto.html" data-type="entity-link" >SupplierFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindManyRequestDto.html" data-type="entity-link" >SupplierFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindManyResponseDto.html" data-type="entity-link" >SupplierFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindOneDataDto.html" data-type="entity-link" >SupplierFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindOneRequestDto.html" data-type="entity-link" >SupplierFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierFindOneResponseDto.html" data-type="entity-link" >SupplierFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierModifyResponseDto.html" data-type="entity-link" >SupplierModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierOptionalDto.html" data-type="entity-link" >SupplierOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentCalcDto.html" data-type="entity-link" >SupplierPaymentCalcDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentCreateOneRequestDto.html" data-type="entity-link" >SupplierPaymentCreateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentCreateOneResponseDto.html" data-type="entity-link" >SupplierPaymentCreateOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentDeleteOneRequestDto.html" data-type="entity-link" >SupplierPaymentDeleteOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindManyDataDto.html" data-type="entity-link" >SupplierPaymentFindManyDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindManyRequestDto.html" data-type="entity-link" >SupplierPaymentFindManyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindManyResponseDto.html" data-type="entity-link" >SupplierPaymentFindManyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindOneDataDto.html" data-type="entity-link" >SupplierPaymentFindOneDataDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindOneRequestDto.html" data-type="entity-link" >SupplierPaymentFindOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentFindOneResponseDto.html" data-type="entity-link" >SupplierPaymentFindOneResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentModifyResponseDto.html" data-type="entity-link" >SupplierPaymentModifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentOptionalDto.html" data-type="entity-link" >SupplierPaymentOptionalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentRequiredDto.html" data-type="entity-link" >SupplierPaymentRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierPaymentUpdateOneRequestDto.html" data-type="entity-link" >SupplierPaymentUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierRequiredDto.html" data-type="entity-link" >SupplierRequiredDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SupplierUpdateOneRequestDto.html" data-type="entity-link" >SupplierUpdateOneRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TokensDto.html" data-type="entity-link" >TokensDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BigIntInterceptor.html" data-type="entity-link" >BigIntInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DecimalToNumberInterceptor.html" data-type="entity-link" >DecimalToNumberInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RefreshTokenInterceptor.html" data-type="entity-link" >RefreshTokenInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RequestQueryTimezoneInterceptor.html" data-type="entity-link" >RequestQueryTimezoneInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RequestResponseInterceptor.html" data-type="entity-link" >RequestResponseInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TimezoneInterceptor.html" data-type="entity-link" >TimezoneInterceptor</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/CheckPermissionGuard.html" data-type="entity-link" >CheckPermissionGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActionFindManyData.html" data-type="entity-link" >ActionFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionFindManyRequest.html" data-type="entity-link" >ActionFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionFindManyResponse.html" data-type="entity-link" >ActionFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionFindOneData.html" data-type="entity-link" >ActionFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionFindOneRequest.html" data-type="entity-link" >ActionFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionFindOneResponse.html" data-type="entity-link" >ActionFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionGetManyRequest.html" data-type="entity-link" >ActionGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionGetOneRequest.html" data-type="entity-link" >ActionGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionModifyResponse.html" data-type="entity-link" >ActionModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionOptional.html" data-type="entity-link" >ActionOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionRequired.html" data-type="entity-link" >ActionRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActionUpdateOneRequest.html" data-type="entity-link" >ActionUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppConfigOptions.html" data-type="entity-link" >AppConfigOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Arrival.html" data-type="entity-link" >Arrival</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalCreateOneRequest.html" data-type="entity-link" >ArrivalCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalCreateOneResponse.html" data-type="entity-link" >ArrivalCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalDeleteOneRequest.html" data-type="entity-link" >ArrivalDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindManyData.html" data-type="entity-link" >ArrivalFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindManyRequest.html" data-type="entity-link" >ArrivalFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindManyResponse.html" data-type="entity-link" >ArrivalFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindOneData.html" data-type="entity-link" >ArrivalFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindOneRequest.html" data-type="entity-link" >ArrivalFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalFindOneResponse.html" data-type="entity-link" >ArrivalFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalGetManyRequest.html" data-type="entity-link" >ArrivalGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalGetOneRequest.html" data-type="entity-link" >ArrivalGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalModifyResponse.html" data-type="entity-link" >ArrivalModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalOptional.html" data-type="entity-link" >ArrivalOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalPayment.html" data-type="entity-link" >ArrivalPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalProduct.html" data-type="entity-link" >ArrivalProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalProductMVCreateOneRequest.html" data-type="entity-link" >ArrivalProductMVCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalProductMVUpdateOneRequest.html" data-type="entity-link" >ArrivalProductMVUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalRequired.html" data-type="entity-link" >ArrivalRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArrivalUpdateOneRequest.html" data-type="entity-link" >ArrivalUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthGetStaffProfile.html" data-type="entity-link" >AuthGetStaffProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthGetValidTokensRequest.html" data-type="entity-link" >AuthGetValidTokensRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthModifyResponse.html" data-type="entity-link" >AuthModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthSignOutRequest.html" data-type="entity-link" >AuthSignOutRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BotConfigOptions.html" data-type="entity-link" >BotConfigOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Client.html" data-type="entity-link" >Client</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientCreateOneRequest.html" data-type="entity-link" >ClientCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientCreateOneResponse.html" data-type="entity-link" >ClientCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientDeed.html" data-type="entity-link" >ClientDeed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientDeedInfo.html" data-type="entity-link" >ClientDeedInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientDeleteOneRequest.html" data-type="entity-link" >ClientDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindManyData.html" data-type="entity-link" >ClientFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindManyRequest.html" data-type="entity-link" >ClientFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindManyResponse.html" data-type="entity-link" >ClientFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindOneData.html" data-type="entity-link" >ClientFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindOneRequest.html" data-type="entity-link" >ClientFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientFindOneResponse.html" data-type="entity-link" >ClientFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientGetManyRequest.html" data-type="entity-link" >ClientGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientGetOneRequest.html" data-type="entity-link" >ClientGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientModifyResponse.html" data-type="entity-link" >ClientModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientOptional.html" data-type="entity-link" >ClientOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPayment.html" data-type="entity-link" >ClientPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentCalc.html" data-type="entity-link" >ClientPaymentCalc</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentCreateOneRequest.html" data-type="entity-link" >ClientPaymentCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentCreateOneResponse.html" data-type="entity-link" >ClientPaymentCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentDeleteOneRequest.html" data-type="entity-link" >ClientPaymentDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindManyData.html" data-type="entity-link" >ClientPaymentFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindManyRequest.html" data-type="entity-link" >ClientPaymentFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindManyResponse.html" data-type="entity-link" >ClientPaymentFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindOneData.html" data-type="entity-link" >ClientPaymentFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindOneRequest.html" data-type="entity-link" >ClientPaymentFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentFindOneResponse.html" data-type="entity-link" >ClientPaymentFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentGetManyRequest.html" data-type="entity-link" >ClientPaymentGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentGetOneRequest.html" data-type="entity-link" >ClientPaymentGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentModifyResponse.html" data-type="entity-link" >ClientPaymentModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentOptional.html" data-type="entity-link" >ClientPaymentOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentRequired.html" data-type="entity-link" >ClientPaymentRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientPaymentUpdateOneRequest.html" data-type="entity-link" >ClientPaymentUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientRequired.html" data-type="entity-link" >ClientRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientUpdateOneRequest.html" data-type="entity-link" >ClientUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CRequest.html" data-type="entity-link" >CRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatabaseConfigOptions.html" data-type="entity-link" >DatabaseConfigOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Debt.html" data-type="entity-link" >Debt</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DefaultOptionalFields.html" data-type="entity-link" >DefaultOptionalFields</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DefaultRequiredFields.html" data-type="entity-link" >DefaultRequiredFields</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalModifyResponse.html" data-type="entity-link" >GlobalModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalResObDef.html" data-type="entity-link" >GlobalResObDef</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalResponse.html" data-type="entity-link" >GlobalResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IArrival.html" data-type="entity-link" >IArrival</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IClient.html" data-type="entity-link" >IClient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IClientPayment.html" data-type="entity-link" >IClientPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProduct.html" data-type="entity-link" >IProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReturning.html" data-type="entity-link" >IReturning</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISelling.html" data-type="entity-link" >ISelling</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStaff.html" data-type="entity-link" >IStaff</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStaffPayment.html" data-type="entity-link" >IStaffPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISupplier.html" data-type="entity-link" >ISupplier</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISupplierPayment.html" data-type="entity-link" >ISupplierPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JwtConfigOptions.html" data-type="entity-link" >JwtConfigOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OldServiceConfigOptions.html" data-type="entity-link" >OldServiceConfigOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationRequest.html" data-type="entity-link" >PaginationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationResponse.html" data-type="entity-link" >PaginationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionCreateOneRequest.html" data-type="entity-link" >PermissionCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionDeleteOneRequest.html" data-type="entity-link" >PermissionDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindManyData.html" data-type="entity-link" >PermissionFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindManyRequest.html" data-type="entity-link" >PermissionFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindManyResponse.html" data-type="entity-link" >PermissionFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindOneData.html" data-type="entity-link" >PermissionFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindOneRequest.html" data-type="entity-link" >PermissionFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionFindOneResponse.html" data-type="entity-link" >PermissionFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionGetManyRequest.html" data-type="entity-link" >PermissionGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionGetOneRequest.html" data-type="entity-link" >PermissionGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionModifyResponse.html" data-type="entity-link" >PermissionModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionOptional.html" data-type="entity-link" >PermissionOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionRequired.html" data-type="entity-link" >PermissionRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionUpdateOneRequest.html" data-type="entity-link" >PermissionUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductCreateOneRequest.html" data-type="entity-link" >ProductCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductDeleteOneRequest.html" data-type="entity-link" >ProductDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindManyData.html" data-type="entity-link" >ProductFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindManyRequest.html" data-type="entity-link" >ProductFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindManyResponse.html" data-type="entity-link" >ProductFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindOneData.html" data-type="entity-link" >ProductFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindOneRequest.html" data-type="entity-link" >ProductFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFindOneResponse.html" data-type="entity-link" >ProductFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductGetManyRequest.html" data-type="entity-link" >ProductGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductGetOneRequest.html" data-type="entity-link" >ProductGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductModifyResponse.html" data-type="entity-link" >ProductModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVDeleteOneRequest.html" data-type="entity-link" >ProductMVDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindManyData.html" data-type="entity-link" >ProductMVFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindManyRequest.html" data-type="entity-link" >ProductMVFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindManyResponse.html" data-type="entity-link" >ProductMVFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindOneData.html" data-type="entity-link" >ProductMVFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindOneRequest.html" data-type="entity-link" >ProductMVFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVFindOneResponse.html" data-type="entity-link" >ProductMVFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVGetManyRequest.html" data-type="entity-link" >ProductMVGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVGetOneRequest.html" data-type="entity-link" >ProductMVGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVModifyResponse.html" data-type="entity-link" >ProductMVModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVOptional.html" data-type="entity-link" >ProductMVOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductMVRequired.html" data-type="entity-link" >ProductMVRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductOptional.html" data-type="entity-link" >ProductOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductRequired.html" data-type="entity-link" >ProductRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductUpdateOneRequest.html" data-type="entity-link" >ProductUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestOtherFields.html" data-type="entity-link" >RequestOtherFields</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Returning.html" data-type="entity-link" >Returning</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningCreateOneRequest.html" data-type="entity-link" >ReturningCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningCreateOneResponse.html" data-type="entity-link" >ReturningCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningDeleteOneRequest.html" data-type="entity-link" >ReturningDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindManyData.html" data-type="entity-link" >ReturningFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindManyRequest.html" data-type="entity-link" >ReturningFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindManyResponse.html" data-type="entity-link" >ReturningFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindOneData.html" data-type="entity-link" >ReturningFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindOneRequest.html" data-type="entity-link" >ReturningFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningFindOneResponse.html" data-type="entity-link" >ReturningFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningGetManyRequest.html" data-type="entity-link" >ReturningGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningGetOneRequest.html" data-type="entity-link" >ReturningGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningModifyResponse.html" data-type="entity-link" >ReturningModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningOptional.html" data-type="entity-link" >ReturningOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningPayment.html" data-type="entity-link" >ReturningPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningProduct.html" data-type="entity-link" >ReturningProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningProductMVCreateOneRequest.html" data-type="entity-link" >ReturningProductMVCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningProductMVUpdateOneRequest.html" data-type="entity-link" >ReturningProductMVUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningRequired.html" data-type="entity-link" >ReturningRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturningUpdateOneRequest.html" data-type="entity-link" >ReturningUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Selling.html" data-type="entity-link" >Selling</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingCalc.html" data-type="entity-link" >SellingCalc</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingCreateOneRequest.html" data-type="entity-link" >SellingCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingCreateOneResponse.html" data-type="entity-link" >SellingCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingDeleteOneRequest.html" data-type="entity-link" >SellingDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindManyData.html" data-type="entity-link" >SellingFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindManyRequest.html" data-type="entity-link" >SellingFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindManyResponse.html" data-type="entity-link" >SellingFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindOneData.html" data-type="entity-link" >SellingFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindOneRequest.html" data-type="entity-link" >SellingFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingFindOneResponse.html" data-type="entity-link" >SellingFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetManyRequest.html" data-type="entity-link" >SellingGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetOneRequest.html" data-type="entity-link" >SellingGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetPeriodStatsData.html" data-type="entity-link" >SellingGetPeriodStatsData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetPeriodStatsRequest.html" data-type="entity-link" >SellingGetPeriodStatsRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetPeriodStatsResponse.html" data-type="entity-link" >SellingGetPeriodStatsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetTotalStatsData.html" data-type="entity-link" >SellingGetTotalStatsData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetTotalStatsRequest.html" data-type="entity-link" >SellingGetTotalStatsRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingGetTotalStatsResponse.html" data-type="entity-link" >SellingGetTotalStatsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingModifyResponse.html" data-type="entity-link" >SellingModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingOptional.html" data-type="entity-link" >SellingOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingPayment.html" data-type="entity-link" >SellingPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingProduct.html" data-type="entity-link" >SellingProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingProductMVCreateOneRequest.html" data-type="entity-link" >SellingProductMVCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingProductMVUpdateOneRequest.html" data-type="entity-link" >SellingProductMVUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingRequired.html" data-type="entity-link" >SellingRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellingUpdateOneRequest.html" data-type="entity-link" >SellingUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Staff.html" data-type="entity-link" >Staff</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffCreateOneRequest.html" data-type="entity-link" >StaffCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffCreateOneResponse.html" data-type="entity-link" >StaffCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffDeleteOneRequest.html" data-type="entity-link" >StaffDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindManyData.html" data-type="entity-link" >StaffFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindManyRequest.html" data-type="entity-link" >StaffFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindManyResponse.html" data-type="entity-link" >StaffFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindOneData.html" data-type="entity-link" >StaffFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindOneRequest.html" data-type="entity-link" >StaffFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffFindOneResponse.html" data-type="entity-link" >StaffFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffGetManyRequest.html" data-type="entity-link" >StaffGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffGetOneRequest.html" data-type="entity-link" >StaffGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffModifyResponse.html" data-type="entity-link" >StaffModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffOptional.html" data-type="entity-link" >StaffOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPayment.html" data-type="entity-link" >StaffPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentCalc.html" data-type="entity-link" >StaffPaymentCalc</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentCreateOneRequest.html" data-type="entity-link" >StaffPaymentCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentCreateOneResponse.html" data-type="entity-link" >StaffPaymentCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentDeleteOneRequest.html" data-type="entity-link" >StaffPaymentDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindManyData.html" data-type="entity-link" >StaffPaymentFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindManyRequest.html" data-type="entity-link" >StaffPaymentFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindManyResponse.html" data-type="entity-link" >StaffPaymentFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindOneData.html" data-type="entity-link" >StaffPaymentFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindOneRequest.html" data-type="entity-link" >StaffPaymentFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentFindOneResponse.html" data-type="entity-link" >StaffPaymentFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentGetManyRequest.html" data-type="entity-link" >StaffPaymentGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentGetOneRequest.html" data-type="entity-link" >StaffPaymentGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentModifyResponse.html" data-type="entity-link" >StaffPaymentModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentOptional.html" data-type="entity-link" >StaffPaymentOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentRequired.html" data-type="entity-link" >StaffPaymentRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffPaymentUpdateOneRequest.html" data-type="entity-link" >StaffPaymentUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffRequired.html" data-type="entity-link" >StaffRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffSignInData.html" data-type="entity-link" >StaffSignInData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffSignInRequest.html" data-type="entity-link" >StaffSignInRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffSignInResponse.html" data-type="entity-link" >StaffSignInResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StaffUpdateOneRequest.html" data-type="entity-link" >StaffUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Supplier.html" data-type="entity-link" >Supplier</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierCreateOneRequest.html" data-type="entity-link" >SupplierCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierCreateOneResponse.html" data-type="entity-link" >SupplierCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierDeed.html" data-type="entity-link" >SupplierDeed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierDeedInfo.html" data-type="entity-link" >SupplierDeedInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierDeleteOneRequest.html" data-type="entity-link" >SupplierDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindManyData.html" data-type="entity-link" >SupplierFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindManyRequest.html" data-type="entity-link" >SupplierFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindManyResponse.html" data-type="entity-link" >SupplierFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindOneData.html" data-type="entity-link" >SupplierFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindOneRequest.html" data-type="entity-link" >SupplierFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierFindOneResponse.html" data-type="entity-link" >SupplierFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierGetManyRequest.html" data-type="entity-link" >SupplierGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierGetOneRequest.html" data-type="entity-link" >SupplierGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierModifyResponse.html" data-type="entity-link" >SupplierModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierOptional.html" data-type="entity-link" >SupplierOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPayment.html" data-type="entity-link" >SupplierPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentCalc.html" data-type="entity-link" >SupplierPaymentCalc</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentCreateOneRequest.html" data-type="entity-link" >SupplierPaymentCreateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentCreateOneResponse.html" data-type="entity-link" >SupplierPaymentCreateOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentDeleteOneRequest.html" data-type="entity-link" >SupplierPaymentDeleteOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindManyData.html" data-type="entity-link" >SupplierPaymentFindManyData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindManyRequest.html" data-type="entity-link" >SupplierPaymentFindManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindManyResponse.html" data-type="entity-link" >SupplierPaymentFindManyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindOneData.html" data-type="entity-link" >SupplierPaymentFindOneData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindOneRequest.html" data-type="entity-link" >SupplierPaymentFindOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentFindOneResponse.html" data-type="entity-link" >SupplierPaymentFindOneResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentGetManyRequest.html" data-type="entity-link" >SupplierPaymentGetManyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentGetOneRequest.html" data-type="entity-link" >SupplierPaymentGetOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentModifyResponse.html" data-type="entity-link" >SupplierPaymentModifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentOptional.html" data-type="entity-link" >SupplierPaymentOptional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentRequired.html" data-type="entity-link" >SupplierPaymentRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierPaymentUpdateOneRequest.html" data-type="entity-link" >SupplierPaymentUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierRequired.html" data-type="entity-link" >SupplierRequired</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierUpdateOneRequest.html" data-type="entity-link" >SupplierUpdateOneRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tokens.html" data-type="entity-link" >Tokens</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});