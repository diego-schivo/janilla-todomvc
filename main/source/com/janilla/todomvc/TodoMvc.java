/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.janilla.todomvc;

import java.lang.reflect.Modifier;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;

import javax.net.ssl.SSLContext;

import com.janilla.http.HttpHandler;
import com.janilla.http.HttpServer;
import com.janilla.ioc.DependencyInjector;
import com.janilla.java.Java;
import com.janilla.json.DollarTypeResolver;
import com.janilla.json.TypeResolver;
import com.janilla.net.Net;
import com.janilla.reflect.ClassAndMethod;
import com.janilla.web.ApplicationHandlerFactory;
import com.janilla.web.Handle;
import com.janilla.web.NotFoundException;
import com.janilla.web.Render;

@Render(template = "index.html")
public class TodoMvc {

	public static final AtomicReference<TodoMvc> INSTANCE = new AtomicReference<>();

	public static void main(String[] args) {
		try {
			TodoMvc a;
			{
				var f = new DependencyInjector(Java.getPackageClasses(TodoMvc.class.getPackageName()), TodoMvc.INSTANCE::get);
				a = f.create(TodoMvc.class, Java.hashMap("factory", f, "configurationFile", args.length > 0 ? Path
						.of(args[0].startsWith("~") ? System.getProperty("user.home") + args[0].substring(1) : args[0])
						: null));
			}

			HttpServer s;
			{
				SSLContext c;
				try (var x = Net.class.getResourceAsStream("testkeys")) {
					c = Net.getSSLContext(Map.entry("JKS", x), "passphrase".toCharArray());
				}
				var p = Integer.parseInt(a.configuration.getProperty("todomvc.server.port"));
				s = a.injector.create(HttpServer.class,
						Map.of("sslContext", c, "endpoint", new InetSocketAddress(p), "handler", a.handler));
			}
			s.serve();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	protected final Properties configuration;

	protected final DependencyInjector injector;

	protected final HttpHandler handler;

	protected final TypeResolver typeResolver;

	public TodoMvc(DependencyInjector injector, Path configurationFile) {
		this.injector = injector;
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
		configuration = injector.create(Properties.class, Collections.singletonMap("file", configurationFile));
		typeResolver = injector.create(DollarTypeResolver.class);

		{
			var f = injector.create(ApplicationHandlerFactory.class, Map.of("methods", types().stream()
					.flatMap(x -> Arrays.stream(x.getMethods()).filter(y -> !Modifier.isStatic(y.getModifiers()))
							.map(y -> new ClassAndMethod(x, y)))
					.toList(), "files",
					Stream.of("com.janilla.frontend", TodoMvc.class.getPackageName())
							.flatMap(x -> Java.getPackagePaths(x).stream().filter(Files::isRegularFile)).toList()));
			handler = x -> {
				var h = f.createHandler(Objects.requireNonNullElse(x.exception(), x.request()));
				if (h == null)
					throw new NotFoundException(x.request().getMethod() + " " + x.request().getTarget());
				return h.handle(x);
			};
		}
	}

	@Handle(method = "GET", path = "/")
	public TodoMvc application() {
		return this;
	}

	public Properties configuration() {
		return configuration;
	}

	public DependencyInjector injector() {
		return injector;
	}

	public HttpHandler handler() {
		return handler;
	}

	public Collection<Class<?>> types() {
		return injector.types();
	}
}
